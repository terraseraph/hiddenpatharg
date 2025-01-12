"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// Define types for jsQR since @types/jsqr is not available
interface Point {
    x: number;
    y: number;
}

interface QRLocation {
    topLeftCorner: Point;
    topRightCorner: Point;
    bottomRightCorner: Point;
    bottomLeftCorner: Point;
}

interface QRCode {
    binaryData: number[];
    data: string;
    location: QRLocation;
}

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string>("");
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        const constraints = { video: { facingMode: "environment" } };

        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setScanning(true);
                    scanQRCode();
                }
            } catch (err) {
                handleError(err);
            }
        }

        function handleError(err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
            setError(errorMessage);
            if (onError) onError(errorMessage);
        }

        function scanQRCode() {
            if (!videoRef.current || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext("2d");

            if (!context) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height) as QRCode | null;

            if (code?.data) {
                onScan(code.data);
                setScanning(false);
                if (videoRef.current?.srcObject instanceof MediaStream) {
                    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }
            } else if (scanning) {
                animationFrameId = requestAnimationFrame(scanQRCode);
            }
        }

        void setupCamera().catch(handleError);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (videoRef.current?.srcObject instanceof MediaStream) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScan, onError, scanning]);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="w-full aspect-square object-cover rounded-lg"
                        playsInline
                    />
                    <canvas
                        ref={canvasRef}
                        className="hidden"
                    />
                    <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none" />
                    {scanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                                Scanning for QR code...
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 