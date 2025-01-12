import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type BasePuzzleProps } from "~/types/puzzle";
import dynamic from "next/dynamic";
import { type IDetectedBarcode } from "@yudiel/react-qr-scanner";

// Dynamically import QR scanner to avoid SSR issues
const QrScanner = dynamic(() => import("@yudiel/react-qr-scanner").then(mod => mod.Scanner), {
    ssr: false
});

export function QRCodePuzzle({ puzzle, onSubmit, disabled }: BasePuzzleProps) {
    const [scanning, setScanning] = useState(false);
    const [manualInput, setManualInput] = useState("");

    const handleScan = (results: IDetectedBarcode[]) => {
        const result = results[0]?.rawValue;
        if (result && !disabled) {
            onSubmit(result);
            setScanning(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!manualInput.trim() || disabled) return;

        onSubmit(manualInput.trim());
        setManualInput("");
    };

    if (scanning) {
        return (
            <div className="space-y-4">
                <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                    <QrScanner
                        onScan={handleScan}
                        onError={(error) => console.log(error?.toString())}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setScanning(false)}
                >
                    Cancel Scanning
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Button
                type="button"
                className="w-full"
                onClick={() => setScanning(true)}
                disabled={disabled}
            >
                Scan QR Code
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or enter code manually
                    </span>
                </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Enter code manually"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    disabled={disabled}
                />
                <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={disabled ?? !manualInput.trim()}
                >
                    Submit Code
                </Button>
            </form>
        </div>
    );
} 