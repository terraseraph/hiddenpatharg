import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";
import { generateUniqueBookingCode } from "~/utils/booking-code";

const createBookingSchema = z.object({
    teamId: z.number(),
    gameId: z.number(),
    startTime: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
    voucher: z.string().optional(),
    paid: z.boolean().optional(),
    notes: z.string().optional(),
});

type CreateBookingInput = z.infer<typeof createBookingSchema>;

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as CreateBookingInput;
        const result = createBookingSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { teamId, gameId, startTime, expiresAt, voucher, paid, notes } = result.data;

        // Generate a unique booking code
        const code = await generateUniqueBookingCode();

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                team: { connect: { id: teamId } },
                game: { connect: { id: gameId } },
                code,
                startTime: startTime ? new Date(startTime) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                voucher,
                paid: paid ?? false,
                notes,
            },
            include: {
                team: {
                    select: {
                        name: true,
                    },
                },
                game: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ booking });
    } catch (err) {
        console.error("Error creating booking:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                game: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                instance: {
                    select: {
                        startedAt: true,
                        completedAt: true,
                        currentPuzzleOrder: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ bookings });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        if (err instanceof Error) {
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
} 