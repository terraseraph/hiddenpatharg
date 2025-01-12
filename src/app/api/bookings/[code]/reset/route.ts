import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { isValidBookingCode } from "~/utils/booking-code";

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

        // Find the booking and its instance
        const booking = await prisma.booking.findUnique({
            where: { code: upperCode },
            include: {
                instance: true,
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

        // Reset the game instance
        const updatedInstance = await prisma.gameInstance.update({
            where: { id: booking.instance.id },
            data: {
                currentPuzzleOrder: 1,
                solvedPuzzles: null,
                completedAt: null,
            },
        });

        return NextResponse.json({ success: true, instance: updatedInstance });
    } catch (error) {
        console.error("Error resetting game progress:", error);
        return NextResponse.json(
            { error: "Failed to reset game progress" },
            { status: 500 }
        );
    }
} 