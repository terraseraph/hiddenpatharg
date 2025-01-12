import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

export async function GET() {
    try {
        const games = await prisma.game.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                id: 'desc',
            },
        });

        return NextResponse.json({ games });
    } catch (err) {
        console.error("Error fetching games:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch games" },
            { status: 500 }
        );
    }
} 