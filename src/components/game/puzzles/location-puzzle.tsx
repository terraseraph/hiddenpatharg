import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type BasePuzzleProps } from "~/types/puzzle";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Compass, Navigation } from "lucide-react";

interface TargetLocation {
    latitude: number;
    longitude: number;
}

function parseLocationData(data: string): TargetLocation | null {
    try {
        const coords = data.split(",").map(Number);
        if (coords.length !== 2 || coords.some(isNaN)) return null;
        const [lat, lon] = coords as [number, number];
        return { latitude: lat, longitude: lon };
    } catch {
        return null;
    }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const λ1 = lon1 * Math.PI / 180;
    const λ2 = lon2 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
}

function CompassDisplay({ bearing, distance }: { bearing: number; distance: number }) {
    return (
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <div className="relative">
                <Compass className="w-32 h-32 text-slate-400" />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `translate(-50%, -50%) rotate(${bearing}deg)` }}
                >
                    <Navigation className="w-16 h-16 text-blue-500" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold">{distance.toFixed(2)} km</p>
                <p className="text-sm text-slate-400">{bearing.toFixed(1)}°</p>
            </div>
        </div>
    );
}

export function LocationPuzzle({ puzzle, onSubmit, disabled }: BasePuzzleProps) {
    const [answer, setAnswer] = useState("");
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [targetLocation, setTargetLocation] = useState<TargetLocation | null>(null);
    const [compass, setCompass] = useState<{ bearing: number; distance: number } | null>(null);

    useEffect(() => {
        if (!puzzle.locationData) return;
        const target = parseLocationData(puzzle.locationData);
        if (target) {
            setTargetLocation(target);
        }
    }, [puzzle.locationData]);

    useEffect(() => {
        if (location && targetLocation) {
            const currentLat = location.coords.latitude;
            const currentLon = location.coords.longitude;
            const targetLat = targetLocation.latitude;
            const targetLon = targetLocation.longitude;

            const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
            const bearing = calculateBearing(currentLat, currentLon, targetLat, targetLon);
            setCompass({ distance, bearing });
        }
    }, [location, targetLocation]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
                setError(null);
            },
            (error) => {
                setError(error.message);
                setLocation(null);
            }
        );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!answer.trim() || disabled) return;

        // If we have location data, include it in the answer
        const finalAnswer = location
            ? `${answer.trim()}|${location.coords.latitude},${location.coords.longitude}`
            : answer.trim();

        onSubmit(finalAnswer);
        setAnswer("");
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Location Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{puzzle.locationData}</p>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleGetLocation}
                    disabled={disabled}
                >
                    {location ? "Update Location" : "Get Current Location"}
                </Button>

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                {location && compass && (
                    <Card>
                        <CardContent>
                            <CompassDisplay
                                bearing={compass.bearing}
                                distance={compass.distance}
                            />
                        </CardContent>
                    </Card>
                )}

                {location && (
                    <p className="text-sm text-muted-foreground">
                        Location captured: {location.coords.latitude.toFixed(6)},{" "}
                        {location.coords.longitude.toFixed(6)}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={disabled}
                    required
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={disabled ?? !answer.trim()}
                >
                    {disabled ? "Checking..." : "Submit Answer"}
                </Button>
            </form>
        </div>
    );
} 