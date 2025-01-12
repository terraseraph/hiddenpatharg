"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { Loading } from "~/components/ui/loading";
import { ProgressBar } from "~/components/game/progress-bar";
import { PuzzleInput } from "~/components/game/puzzle-input";
import { useGameSession } from "~/hooks/use-game-session";
import { type PuzzleType } from "~/types/puzzle";

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
                type: PuzzleType;
                choices?: {
                    id: string;
                    text: string;
                }[];
            }[];
        };
        instance: {
            id: number;
            currentPuzzleOrder: number | null;
        } | null;
    };
}

interface AnswerResponse {
    success: boolean;
    message: string;
    nextPuzzle?: {
        id: number;
    };
}

interface Props {
    params: Promise<{
        code: string;
        puzzleId: string;
    }>;
}

export default function PuzzlePage({ params }: Props) {
    const resolvedParams = use(params);
    const [booking, setBooking] = useState<BookingResponse['booking'] | null>(null);
    const [currentPuzzle, setCurrentPuzzle] = useState<BookingResponse['booking']['game']['puzzles'][0] | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const { session, updateSession } = useGameSession(resolvedParams.code);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/bookings/${resolvedParams.code}`);
                if (!response.ok) throw new Error("Failed to fetch data");

                const data = (await response.json()) as BookingResponse;
                const puzzle = data.booking.game.puzzles.find(p => p.id === parseInt(resolvedParams.puzzleId));

                if (!puzzle) {
                    throw new Error("Puzzle not found");
                }

                setBooking(data.booking);
                setCurrentPuzzle(puzzle);
                updateSession({ currentPuzzleId: puzzle.id });
            } catch (error) {
                console.error("Error fetching data:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.code, resolvedParams.puzzleId, router]);

    async function handleSubmit(answer: string) {
        if (submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/bookings/${resolvedParams.code}/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    puzzleId: parseInt(resolvedParams.puzzleId),
                    answer: answer.trim()
                }),
            });

            const data = (await response.json()) as AnswerResponse;

            if (data.success) {
                toast({
                    title: "Correct!",
                    description: data.message,
                });

                // If there's no next puzzle, go to completion page
                if (!data.nextPuzzle) {
                    router.push(`/play/${resolvedParams.code}/complete`);
                    return;
                }

                // Otherwise, go to next puzzle
                router.push(`/play/${resolvedParams.code}/puzzle/${data.nextPuzzle.id}`);
            } else {
                toast({
                    variant: "destructive",
                    title: "Incorrect",
                    description: data.message,
                });
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to submit answer",
            });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading || !booking || !currentPuzzle) {
        return <Loading message="Loading puzzle..." />;
    }

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
                    <CardTitle className="text-2xl">
                        Puzzle #{currentPuzzle.order}: {currentPuzzle.question}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PuzzleInput
                        puzzle={currentPuzzle}
                        onSubmit={handleSubmit}
                        disabled={submitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 