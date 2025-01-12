"use client";

import { useState, useEffect, use } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { type Game } from "@prisma/client";
import { isValidBookingCode } from "~/utils/booking-code";
import { TeamForm, type Player } from "~/components/team-form";
import { GameProgress } from "~/components/game/game-progress";

interface BookingData {
    id: number;
    teamId: number;
    gameId: number;
    code: string;
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
        }[];
    };
    instance: {
        id: number;
        currentPuzzleOrder: number | null;
    } | null;
}

interface Props {
    params: Promise<{
        code: string;
    }>;
}

export default function EditBookingPage({ params }: Props) {
    const { code } = use(params);
    if (!isValidBookingCode(code)) {
        notFound();
    }
    return <EditBookingPageContent code={code} />;
}

function EditBookingPageContent({ code }: { code: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [bookingResponse, teamsResponse, gamesResponse] = await Promise.all([
                    fetch(`/api/bookings/${code}`),
                    fetch('/api/teams'),
                    fetch('/api/games')
                ]);

                if (!bookingResponse.ok) throw new Error('Failed to fetch booking');
                if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
                if (!gamesResponse.ok) throw new Error('Failed to fetch games');

                const bookingData = await bookingResponse.json() as { booking: BookingData };
                const teamsData = await teamsResponse.json() as { teams: Team[] };
                const gamesData = await gamesResponse.json() as { games: Game[] };

                setBooking(bookingData.booking);
                setTeams(teamsData.teams);
                setGames(gamesData.games);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load booking data",
                });
                router.push('/admin/bookings');
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, [code, router, toast]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const teamId = parseInt(formData.get("teamId") as string);
            const gameId = parseInt(formData.get("gameId") as string);
            const startTime = formData.get("startTime") as string;
            const expiresAt = formData.get("expiresAt") as string;
            const voucher = formData.get("voucher") as string;
            const paid = formData.get("paid") === "on";
            const notes = formData.get("notes") as string;

            const response = await fetch(`/api/bookings/${code}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teamId,
                    gameId,
                    startTime: startTime || null,
                    expiresAt: expiresAt || null,
                    voucher: voucher || null,
                    paid,
                    notes: notes || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update booking");
            }

            toast({
                title: "Success",
                description: "Booking updated successfully",
            });
            router.push("/admin/bookings");
            router.refresh();
        } catch (error) {
            console.error("Error updating booking:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update booking",
            });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading || !booking) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
                <p className="text-slate-400">Update booking details for code: <span className="font-mono">{booking.code}</span></p>
            </div>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="teamId">Team</Label>
                            <Select name="teamId" defaultValue={booking.teamId.toString()} required>
                                <SelectTrigger className="bg-slate-950">
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id.toString()}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gameId">Game</Label>
                            <Select name="gameId" defaultValue={booking.gameId.toString()} required>
                                <SelectTrigger className="bg-slate-950">
                                    <SelectValue placeholder="Select a game" />
                                </SelectTrigger>
                                <SelectContent>
                                    {games.map((game) => (
                                        <SelectItem key={game.id} value={game.id.toString()}>
                                            {game.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startTime">
                                Start Time
                                <span className="ml-1 text-sm text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="datetime-local"
                                name="startTime"
                                defaultValue={booking.startTime?.slice(0, 16) ?? ""}
                                className="bg-slate-950"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiresAt">
                                Expires At
                                <span className="ml-1 text-sm text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="datetime-local"
                                name="expiresAt"
                                defaultValue={booking.expiresAt?.slice(0, 16) ?? ""}
                                className="bg-slate-950"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="voucher">
                                Voucher Code
                                <span className="ml-1 text-sm text-slate-400">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="text"
                                name="voucher"
                                defaultValue={booking.voucher ?? ""}
                                className="bg-slate-950"
                                placeholder="Enter voucher code"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="paid"
                                name="paid"
                                defaultChecked={booking.paid}
                            />
                            <Label htmlFor="paid">Payment Received</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                name="notes"
                                defaultValue={booking.notes ?? ""}
                                className="bg-slate-950"
                                placeholder="Add any notes about this booking"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {booking.team && (
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>Team Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TeamForm
                            defaultValues={{
                                name: booking.team.name,
                                players: booking.team.players ?? [],
                            }}
                            onSubmit={async (data) => {
                                try {
                                    const response = await fetch(`/api/teams/${booking.team.id}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(data),
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json() as { error: string };
                                        throw new Error(errorData.error ?? 'Failed to update team');
                                    }

                                    toast({
                                        title: "Success",
                                        description: "Team updated successfully",
                                    });

                                    router.refresh();
                                } catch (error) {
                                    console.error('Error updating team:', error);
                                    toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description: error instanceof Error ? error.message : "Failed to update team",
                                    });
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            )}

            <GameProgress
                code={code}
                currentPuzzleOrder={booking.instance?.currentPuzzleOrder ?? null}
                puzzles={booking.game.puzzles}
                solvedPuzzles={booking.instance?.solvedPuzzles ? JSON.parse(booking.instance.solvedPuzzles) : {}}
            />
        </div>
    );
} 