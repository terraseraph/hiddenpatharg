"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { TeamForm, type Player } from "~/components/team-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Game {
    id: number;
    name: string;
    description: string;
}

interface Team {
    id: number;
    name: string;
    players: Player[];
}

interface TeamResponse {
    team: {
        id: number;
    };
}

interface TeamsResponse {
    teams: Team[];
}

interface BookingResponse {
    booking: {
        code: string;
    };
}

interface GamesResponse {
    games: Game[];
}

interface ErrorResponse {
    error: string;
}

interface BookingDetails {
    gameId: number;
    startTime: string | null;
    expiresAt: string | null;
    voucher: string | null;
    paid: boolean;
    notes: string | null;
}

type Step = 'booking' | 'team';

export default function NewBookingPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<Step>('booking');
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const [gamesResponse, teamsResponse] = await Promise.all([
                    fetch('/api/games'),
                    fetch('/api/teams')
                ]);

                if (!gamesResponse.ok) throw new Error('Failed to fetch games');
                if (!teamsResponse.ok) throw new Error('Failed to fetch teams');

                const gamesData = await gamesResponse.json() as GamesResponse;
                const teamsData = await teamsResponse.json() as TeamsResponse;

                setGames(gamesData.games);
                setTeams(teamsData.teams);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load data",
                });
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, [toast]);

    async function createBookingWithTeam(teamId: number) {
        if (!bookingDetails) return;

        try {
            setSubmitting(true);
            const bookingResponse = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId,
                    gameId: bookingDetails.gameId,
                    startTime: bookingDetails.startTime ? new Date(bookingDetails.startTime).toISOString() : undefined,
                    expiresAt: bookingDetails.expiresAt ? new Date(bookingDetails.expiresAt).toISOString() : undefined,
                    voucher: bookingDetails.voucher ?? undefined,
                    paid: bookingDetails.paid,
                    notes: bookingDetails.notes ?? undefined,
                }),
            });

            if (!bookingResponse.ok) {
                const errorData = await bookingResponse.json() as ErrorResponse;
                throw new Error(errorData.error ?? 'Failed to create booking');
            }

            const bookingData = await bookingResponse.json() as BookingResponse;

            toast({
                title: "Success",
                description: `Booking created! Code: ${bookingData.booking.code}`,
            });

            router.push('/admin/bookings');
        } catch (error) {
            console.error('Error creating booking:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create booking",
            });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
                <p className="text-slate-400">Create a new booking and team.</p>
            </div>

            {step === 'booking' ? (
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const gameId = formData.get('gameId') as string | null;
                        const startTime = formData.get('startTime') as string | null;
                        const expiresAt = formData.get('expiresAt') as string | null;
                        const voucher = formData.get('voucher') as string | null;
                        const notes = formData.get('notes') as string | null;
                        const paid = formData.get('paid') as string | null;

                        if (!gameId) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Please select a game",
                            });
                            return;
                        }

                        setBookingDetails({
                            gameId: Number(gameId),
                            startTime: startTime ?? null,
                            expiresAt: expiresAt ?? null,
                            voucher: voucher ?? null,
                            paid: paid === 'on',
                            notes: notes ?? null,
                        });

                        setStep('team');
                    }}
                    className="space-y-8"
                >
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="gameId">Game</Label>
                                <select
                                    id="gameId"
                                    name="gameId"
                                    required
                                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2"
                                >
                                    <option value="">Select a game</option>
                                    {games.map((game) => (
                                        <option key={game.id} value={game.id}>
                                            {game.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="datetime-local"
                                    className="bg-slate-950"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiresAt">Expires At</Label>
                                <Input
                                    id="expiresAt"
                                    name="expiresAt"
                                    type="datetime-local"
                                    className="bg-slate-950"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="voucher">Voucher Code</Label>
                                <Input
                                    id="voucher"
                                    name="voucher"
                                    className="bg-slate-950"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="paid"
                                    name="paid"
                                />
                                <Label
                                    htmlFor="paid"
                                    className="font-normal"
                                >
                                    Paid
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    className="bg-slate-950"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Continue to Team Selection
                        </Button>
                    </div>
                </form>
            ) : (
                <Tabs defaultValue="new" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">Create New Team</TabsTrigger>
                        <TabsTrigger value="existing">Select Existing Team</TabsTrigger>
                    </TabsList>
                    <TabsContent value="new">
                        <TeamForm
                            onSubmit={async (data) => {
                                setSubmitting(true);
                                try {
                                    const teamResponse = await fetch('/api/teams', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(data),
                                    });

                                    if (!teamResponse.ok) {
                                        const errorData = await teamResponse.json() as ErrorResponse;
                                        throw new Error(errorData.error ?? 'Failed to create team');
                                    }

                                    const teamResult = await teamResponse.json() as TeamResponse;
                                    await createBookingWithTeam(teamResult.team.id);
                                } catch (error) {
                                    console.error('Error creating team:', error);
                                    toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description: error instanceof Error ? error.message : "Failed to create team",
                                    });
                                    setSubmitting(false);
                                }
                            }}
                            submitLabel="Create Team & Booking"
                            isSubmitting={submitting}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('booking')}
                            className="mt-4"
                        >
                            Back to Booking
                        </Button>
                    </TabsContent>
                    <TabsContent value="existing" className="space-y-4">
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardHeader>
                                <CardTitle>Select Team</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {teams.map((team) => (
                                        <div
                                            key={team.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-slate-900/50"
                                        >
                                            <div>
                                                <h3 className="font-medium">{team.name}</h3>
                                                <p className="text-sm text-slate-400">
                                                    {team.players.length} players
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => createBookingWithTeam(team.id)}
                                                disabled={submitting}
                                            >
                                                {submitting ? "Creating..." : "Select & Create Booking"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('booking')}
                            className="mt-4"
                        >
                            Back to Booking
                        </Button>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
} 