import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";
import { Player } from "~/types/team";

const updateTeamSchema = z.object({
    name: z.string().min(1),
    players: z.array(z.object({
        id: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().nullable(),
        isTeamLeader: z.boolean(),
        details: z.record(z.unknown()).nullable(),
    })),
});

export async function GET(
    req: Request,
    context: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await context.params;
        const id = parseInt(teamId);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid team ID" },
                { status: 400 }
            );
        }

        const team = await prisma.team.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                players: true,
                bookings: {
                    include: {
                        game: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        instance: true,
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

        // Parse the players JSON string
        const players = JSON.parse(team.players) as Player[];

        return NextResponse.json({
            team: {
                ...team,
                players,
            }
        });
    } catch (err) {
        console.error("Error fetching team:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch team" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await context.params;
        const id = parseInt(teamId);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid team ID" },
                { status: 400 }
            );
        }

        await prisma.team.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error deleting team:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete team" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await context.params;
        const id = parseInt(teamId);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid team ID" },
                { status: 400 }
            );
        }

        const body = await req.json() as z.infer<typeof updateTeamSchema>;
        const result = updateTeamSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, players } = result.data;

        // Update team with players as JSON string
        const updatedTeam = await prisma.team.update({
            where: { id },
            data: {
                name,
                players: JSON.stringify(players)
            },
            select: {
                id: true,
                name: true,
                players: true,
                bookings: {
                    include: {
                        game: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        instance: true,
                    },
                },
            },
        });

        return NextResponse.json({
            team: {
                ...updatedTeam,
                players: JSON.parse(updatedTeam.players) as Player[]
            }
        });
    } catch (err) {
        console.error("Error updating team:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update team" },
            { status: 500 }
        );
    }
}
