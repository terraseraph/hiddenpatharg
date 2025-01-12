import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { isValidBookingCode } from "~/utils/booking-code";
import { z } from "zod";

const skipSchema = z.object({
    order: z.number().min(1),
});

export async function POST(
    request: Request,
    context: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await context.params;
        const upperCode = code.toUpperCase();

        if (!isValidBookingCode(upperCode)) {
            return NextResponse.json(
                { error: "Invalid booking code format" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const result = skipSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Find the booking and its instance
        const booking = await prisma.booking.findUnique({
            where: { code: upperCode },
            include: {
                instance: true,
                game: {
                    select: {
                        puzzles: {
                            select: {
                                order: true,
                            },
                        },
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        if (!booking.instance) {
            return NextResponse.json(
                { error: "No game instance found" },
                { status: 404 }
            );
        }

        // Validate that the order exists in the game
        const maxOrder = Math.max(...booking.game.puzzles.map(p => p.order));
        if (result.data.order > maxOrder) {
            return NextResponse.json(
                { error: "Invalid puzzle order" },
                { status: 400 }
            );
        }

        // Skip to the specified puzzle
        const updatedInstance = await prisma.gameInstance.update({
            where: { id: booking.instance.id },
            data: {
                currentPuzzleOrder: result.data.order,
            },
        });

        return NextResponse.json({ success: true, instance: updatedInstance });
    } catch (error) {
        console.error("Error skipping to puzzle:", error);
        return NextResponse.json(
            { error: "Failed to skip to puzzle" },
            { status: 500 }
        );
    }
} 