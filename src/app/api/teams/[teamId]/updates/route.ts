import { prisma } from "~/server/db";

export async function GET(
    request: Request,
    { params }: { params: { teamId: string } }
) {
    const teamId = parseInt(params.teamId);

    // Set headers for SSE
    const headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    };

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Initial state
                const team = await prisma.team.findUnique({
                    where: { id: teamId },
                    select: {
                        id: true,
                        name: true,
                        players: true,
                    },
                });

                if (!team) {
                    controller.close();
                    return;
                }

                // Send initial state
                const data = JSON.stringify({
                    players: JSON.parse(team.players),
                    timestamp: new Date().toISOString(),
                });
                controller.enqueue(`data: ${data}\n\n`);

                // Keep connection alive with a heartbeat
                const heartbeat = setInterval(() => {
                    controller.enqueue(": heartbeat\n\n");
                }, 30000);

                // Clean up
                request.signal.addEventListener("abort", () => {
                    clearInterval(heartbeat);
                    controller.close();
                });
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new Response(stream, { headers });
} 