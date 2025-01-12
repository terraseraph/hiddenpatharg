import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";

const joinGameSchema = z.object({
    teamCode: z.string().min(1),
    gameId: z.number().int().positive(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = joinGameSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { teamCode, gameId } = result.data;

        // Find the team by code
        const team = await prisma.team.findUnique({
            where: { code: teamCode },
            select: {
                id: true,
                name: true,
                players: true,
                bookings: {
                    select: {
                        game: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!team) {
            return NextResponse.json(
                { error: "Team not found" },
                { status: 404 }
            );
        }

        // Check if team is already in a game
        const existingBooking = team.bookings.find(b => b.game.id === gameId);
        if (existingBooking) {
            return NextResponse.json(
                { error: "Team is already part of this game" },
                { status: 400 }
            );
        }

        // Update the team with the game
        const updatedTeam = await prisma.team.update({
            where: { id: team.id },
            data: {
                bookings: {
                    create: {
                        game: {
                            connect: { id: gameId },
                        },
                        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    },
                },
            },
            select: {
                id: true,
                name: true,
                players: true,
                bookings: {
                    select: {
                        game: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            team: {
                ...updatedTeam,
                players: JSON.parse(updatedTeam.players),
            },
        });
    } catch (err) {
        console.error("Error joining game:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to join game" },
            { status: 500 }
        );
    }
} 