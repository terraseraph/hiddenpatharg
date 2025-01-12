"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Loading } from "~/components/ui/loading";
import { ProgressBar } from "~/components/game/progress-bar";
import { useGameSession } from "~/hooks/use-game-session";

interface BookingResponse {
    booking: {
        id: number;
        code: string;
        teamId: number;
        gameId: number;
        startTime: string | null;
        expiresAt: string | null;
        voucher: string | null;
        paid: boolean;
        notes: string | null;
        team: {
            id: number;
            name: string;
        };
        game: {
            id: number;
            name: string;
            description: string;
            puzzles: {
                id: number;
                order: number;
                question: string;
            }[];
        };
        instance: {
            id: number;
            currentPuzzleOrder: number | null;
        } | null;
    };
}

interface Props {
    params: Promise<{
        code: string;
    }>;
}

function GameInfoPageContent({ code }: { code: string }) {
    const [booking, setBooking] = useState<BookingResponse['booking'] | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { session, updateSession } = useGameSession(code);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/bookings/${code}`);
                if (!response.ok) throw new Error("Failed to fetch game data");

                const data = (await response.json()) as BookingResponse;
                setBooking(data.booking);

                // If we have a current puzzle, update the session
                if (data.booking.instance?.currentPuzzleOrder) {
                    const currentPuzzle = data.booking.game.puzzles.find(p => p.order === data.booking.instance?.currentPuzzleOrder);
                    if (currentPuzzle) {
                        updateSession({ currentPuzzleId: currentPuzzle.id });
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, router]);

    if (loading || !booking) {
        return <Loading message="Loading game info..." />;
    }

    const handleStart = () => {
        // If there's a current puzzle, go to it, otherwise start from the first one
        const puzzleOrder = booking.instance?.currentPuzzleOrder ?? 1;
        const puzzle = booking.game.puzzles.find(p => p.order === puzzleOrder);
        if (puzzle) {
            router.push(`/play/${code}/puzzle/${puzzle.id}`);
        }
    };

    return (
        <div className="container max-w-2xl py-8 space-y-6">
            {booking.instance?.currentPuzzleOrder && (
                <ProgressBar
                    currentPuzzle={booking.instance.currentPuzzleOrder}
                    totalPuzzles={booking.game.puzzles.length}
                />
            )}

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-2xl">{booking.game.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Welcome, {booking.team.name}!</h3>
                        <p className="text-slate-400">{booking.game.description}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Game Overview</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-400">
                            <li>{booking.game.puzzles.length} puzzles to solve</li>
                            {booking.instance?.currentPuzzleOrder && (
                                <li>You are currently on puzzle #{booking.instance.currentPuzzleOrder}</li>
                            )}
                        </ul>
                    </div>

                    <Button onClick={handleStart} className="w-full group">
                        {booking.instance?.currentPuzzleOrder ? "Continue Playing" : "Start Game"}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function GameInfoPage({ params }: Props) {
    const resolvedParams = use(params);
    return <GameInfoPageContent code={resolvedParams.code} />;
} 