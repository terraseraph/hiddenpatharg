import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";
import { Player } from "~/types/team";

const createTeamSchema = z.object({
    name: z.string().min(1),
    players: z.array(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().nullable(),
        isTeamLeader: z.boolean(),
        details: z.record(z.unknown()).nullable(),
    })),
});

export async function GET() {
    try {
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                players: true,
                bookings: {
                    select: {
                        id: true,
                        code: true,
                        gameId: true,
                        game: {
                            select: {
                                name: true,
                            },
                        },
                        createdAt: true,
                        expiresAt: true,
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });

        // Parse players JSON for each team
        const teamsWithParsedPlayers = teams.map(team => ({
            ...team,
            players: JSON.parse(team.players) as Player[],
        }));

        return NextResponse.json({ teams: teamsWithParsedPlayers });
    } catch (err) {
        console.error("Error fetching teams:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = createTeamSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, players } = result.data;

        // Create the team with players as JSON
        const team = await prisma.team.create({
            data: {
                name,
                players: JSON.stringify(players.map((player, index) => ({
                    id: index + 1, // Generate sequential IDs for new players
                    name: player.name,
                    email: player.email,
                    phone: player.phone,
                    isTeamLeader: player.isTeamLeader,
                    details: player.details,
                }))),
            },
            select: {
                id: true,
                name: true,
                players: true,
                bookings: {
                    select: {
                        id: true,
                        code: true,
                        gameId: true,
                        game: {
                            select: {
                                name: true,
                            },
                        },
                        createdAt: true,
                        expiresAt: true,
                    },
                },
            },
        });

        return NextResponse.json({
            team: {
                ...team,
                players: JSON.parse(team.players) as Player[],
            }
        });
    } catch (err) {
        console.error("Error creating team:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create team" },
            { status: 500 }
        );
    }
} 