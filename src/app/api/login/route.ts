import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { isValidBookingCode } from "~/utils/booking-code";

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code || !isValidBookingCode(code)) {
            return NextResponse.json(
                { error: "Invalid booking code format" },
                { status: 400 }
            );
        }

        // Find the booking and related data
        const booking = await prisma.booking.findUnique({
            where: { code },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        players: true,
                    },
                },
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
        console.log("🚀============== ~ file: route.ts:37 ~ POST ~ booking================", booking)

        if (!booking) {
            return NextResponse.json(
                { error: "Invalid booking code" },
                { status: 400 }
            );
        }

        if (booking.expiresAt && new Date(booking.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: "This booking has expired" },
                { status: 400 }
            );
        }

        // Create or get game instance
        let gameInstance = booking.instance;
        if (!gameInstance) {
            gameInstance = await prisma.gameInstance.create({
                data: {
                    teamId: booking.teamId,
                    gameId: booking.gameId,
                    bookingId: booking.id,
                    currentPuzzleOrder: 1,
                },
            });
        }

        // Parse team players
        const team = {
            ...booking.team,
            players: JSON.parse(booking.team.players),
        };

        // Redirect to game info page
        // return a response with the booking data
        return NextResponse.json({ success: true, booking, gameInstance, team });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
} 