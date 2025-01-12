"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface Puzzle {
    id: number;
    order: number;
    question: string;
}

interface GameProgressProps {
    code: string;
    currentPuzzleOrder: number | null;
    puzzles: Puzzle[];
    solvedPuzzles?: Record<string, string>; // puzzle ID -> solved timestamp
}

export function GameProgress({ code, currentPuzzleOrder, puzzles, solvedPuzzles = {} }: GameProgressProps) {
    const router = useRouter();
    const { toast } = useToast();

    async function handleReset() {
        try {
            const response = await fetch(`/api/bookings/${code}/reset`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Failed to reset game");

            toast({
                title: "Success",
                description: "Game progress has been reset",
            });
            router.refresh();
        } catch (error) {
            console.error("Error resetting game:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to reset game progress",
            });
        }
    }

    async function handlePreviousPuzzle() {
        if (!currentPuzzleOrder || currentPuzzleOrder <= 1) return;

        try {
            const response = await fetch(`/api/bookings/${code}/previous`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Failed to move to previous puzzle");

            toast({
                title: "Success",
                description: "Moved to previous puzzle",
            });
            router.refresh();
        } catch (error) {
            console.error("Error moving to previous puzzle:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to move to previous puzzle",
            });
        }
    }

    async function handleSkipTo(order: number) {
        try {
            const response = await fetch(`/api/bookings/${code}/skip`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ order }),
            });

            if (!response.ok) throw new Error("Failed to skip to puzzle");

            toast({
                title: "Success",
                description: `Skipped to puzzle #${order}`,
            });
            router.refresh();
        } catch (error) {
            console.error("Error skipping to puzzle:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to skip to puzzle",
            });
        }
    }

    function getPuzzleStatus(puzzle: Puzzle) {
        if (solvedPuzzles[puzzle.id.toString()]) {
            return {
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                text: "Solved",
                solved: true,
            };
        }
        if (currentPuzzleOrder === puzzle.order) {
            return {
                icon: <Circle className="w-5 h-5 text-blue-500 fill-blue-500" />,
                text: "Current",
                current: true,
            };
        }
        if (!currentPuzzleOrder || currentPuzzleOrder < puzzle.order) {
            return {
                icon: <Circle className="w-5 h-5 text-slate-500" />,
                text: "Not Started",
            };
        }
        return {
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            text: "Skipped",
        };
    }

    return (
        <Card className="border-slate-800 bg-slate-900/50 mt-6">
            <CardHeader>
                <CardTitle>Game Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Current Progress</Label>
                    <p className="text-slate-400">
                        {currentPuzzleOrder
                            ? `Currently on puzzle #${currentPuzzleOrder} of ${puzzles.length}`
                            : "Game not started"}
                    </p>
                </div>

                <div className="space-y-4">
                    <Label>Puzzle Status</Label>
                    <div className="rounded-md border border-slate-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Order</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {puzzles.map((puzzle) => {
                                    const status = getPuzzleStatus(puzzle);
                                    return (
                                        <TableRow key={puzzle.id}>
                                            <TableCell>{puzzle.order}</TableCell>
                                            <TableCell>{puzzle.question}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {status.icon}
                                                    <span>{status.text}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {!status.current && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSkipTo(puzzle.order)}
                                                    >
                                                        Skip to
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Game Actions</Label>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                        >
                            Reset Progress
                        </Button>
                        {currentPuzzleOrder && currentPuzzleOrder > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePreviousPuzzle}
                            >
                                Previous Puzzle
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 