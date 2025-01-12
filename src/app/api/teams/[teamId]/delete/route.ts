import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

export async function POST(
    req: Request,
    { params }: { params: { teamId: string } }
) {
    try {
        const teamId = parseInt(params.teamId);

        if (isNaN(teamId)) {
            return NextResponse.json(
                { error: "Invalid team ID" },
                { status: 400 }
            );
        }

        // Delete the team
        await prisma.team.delete({
            where: { id: teamId },
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