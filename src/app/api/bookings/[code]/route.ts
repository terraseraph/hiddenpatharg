import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { isValidBookingCode } from "~/utils/booking-code";
import { type Player } from "~/types/team";

// Define the response interface
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
            players: Player[];
        };
        game: {
            id: number;
            name: string;
            description: string;
            puzzles: {
                id: number;
                order: number;
                question: string;
                type: string;
                choices?: {
                    id: string;
                    text: string;
                }[];
                locationData?: string;
                imageUrl?: string;
            }[];
        };
        instance: {
            id: number;
            currentPuzzleOrder: number | null;
        } | null;
    };
}

export async function GET(
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

        const result = await prisma.booking.findUnique({
            where: { code: upperCode },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        players: true,
                    },
                },
                game: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        puzzles: {
                            select: {
                                id: true,
                                order: true,
                                question: true,
                                type: true,
                                choices: true,
                                locationData: true,
                                imageUrl: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
                instance: {
                    select: {
                        id: true,
                        currentPuzzleOrder: true,
                    },
                },
            },
        });

        if (!result) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        const response: BookingResponse = {
            booking: {
                ...result,
                startTime: result.startTime?.toISOString() ?? null,
                expiresAt: result.expiresAt?.toISOString() ?? null,
                team: {
                    ...result.team,
                    players: result.team.players ? JSON.parse(result.team.players as string) : [],
                },
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking data" },
            { status: 500 }
        );
    }
}

export async function PATCH(
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

        const body = await request.json() as {
            teamId: number;
            gameId: number;
            startTime: string | null;
            expiresAt: string | null;
            voucher: string | null;
            paid: boolean;
            notes: string | null;
        };

        const booking = await prisma.booking.update({
            where: { code: upperCode },
            data: {
                team: { connect: { id: body.teamId } },
                game: { connect: { id: body.gameId } },
                startTime: body.startTime ? new Date(body.startTime) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                voucher: body.voucher,
                paid: body.paid,
                notes: body.notes,
            },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        players: true,
                    },
                },
                game: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            booking: {
                ...booking,
                team: {
                    ...booking.team,
                    players: booking.team.players ? JSON.parse(booking.team.players as string) : [],
                },
            },
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json(
            { error: "Failed to update booking" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        await prisma.booking.delete({
            where: { code: upperCode },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting booking:", error);
        return NextResponse.json(
            { error: "Failed to delete booking" },
            { status: 500 }
        );
    }
}