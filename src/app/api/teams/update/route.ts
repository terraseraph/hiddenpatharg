import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";
import { Player } from "~/types/team";

const updateTeamSchema = z.object({
    teamId: z.string().transform(val => parseInt(val)),
    teamName: z.string().min(1),
    players: z.string().transform(val =>
        val.split(/\n/)
            .map((line, index) => {
                const [name, email, phone] = line.split(',').map(s => s.trim());
                return {
                    id: index + 1,
                    name,
                    email,
                    phone: phone || null,
                    isTeamLeader: false,
                    details: null,
                };
            })
            .filter(({ name, email }) => name && email)
    ),
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());
        const result = updateTeamSchema.safeParse(data);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { teamId, teamName, players } = result.data;

        // Update the team
        const team = await prisma.team.update({
            where: { id: teamId },
            data: {
                name: teamName,
                players: JSON.stringify(players),
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
                        instance: {
                            select: {
                                id: true,
                                startedAt: true,
                                completedAt: true,
                                currentPuzzleOrder: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            team: {
                ...team,
                players: JSON.parse(team.players) as Player[],
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