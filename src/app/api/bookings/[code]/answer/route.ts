import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { isValidBookingCode } from "~/utils/booking-code";

interface AnswerRequest {
    puzzleId: number;
    answer?: string;
    restore?: boolean;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const upperCode = code.toUpperCase();

        if (!isValidBookingCode(upperCode)) {
            return NextResponse.json(
                { error: "Invalid booking code format" },
                { status: 400 }
            );
        }

        const body = (await request.json()) as AnswerRequest;
        const { puzzleId, answer, restore } = body;

        // Get booking and related data
        const booking = await prisma.booking.findUnique({
            where: { code: upperCode },
            include: {
                game: {
                    include: {
                        puzzles: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
                instance: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Invalid booking code" },
                { status: 400 }
            );
        }

        // Get current puzzle
        const puzzle = booking.game.puzzles.find(p => p.id === puzzleId);
        if (!puzzle) {
            return NextResponse.json(
                { error: "Puzzle not found" },
                { status: 404 }
            );
        }

        // If this is a restore request, just validate the puzzle exists
        if (restore) {
            return NextResponse.json({
                success: true,
                message: "Puzzle state restored",
            });
        }

        // For actual answer submissions, check if this is the current puzzle
        if (puzzle.order !== booking.instance?.currentPuzzleOrder) {
            return NextResponse.json(
                { error: "This is not your current puzzle" },
                { status: 400 }
            );
        }

        // Check answer (we know answer exists here since restore is false)
        if (puzzle.answer.toLowerCase() === answer!.toLowerCase()) {
            // Find next puzzle
            const nextPuzzle = booking.game.puzzles.find(p => p.order === puzzle.order + 1);

            // Update instance
            await prisma.gameInstance.update({
                where: { id: booking.instance.id },
                data: {
                    currentPuzzleOrder: nextPuzzle?.order ?? null,
                    completedAt: !nextPuzzle ? new Date() : undefined,
                },
            });

            return NextResponse.json({
                success: true,
                message: nextPuzzle
                    ? "Correct! Moving to next puzzle..."
                    : "Congratulations! You've completed all puzzles!",
                nextPuzzle: nextPuzzle ? { id: nextPuzzle.id } : undefined,
            });
        }

        return NextResponse.json({
            success: false,
            message: "Incorrect answer, try again!",
        });
    } catch (error) {
        console.error("Error processing answer:", error);
        return NextResponse.json(
            { error: "Failed to process answer" },
            { status: 500 }
        );
    }
} 