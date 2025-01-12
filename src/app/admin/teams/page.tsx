"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, Plus } from "lucide-react";
import type { Game } from "@prisma/client";
import { JoinGameDialog } from "./JoinGameDialog";
import { toast } from "~/hooks/use-toast";

interface Player {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    isTeamLeader: boolean;
}

type TeamWithRelations = {
    id: number;
    name: string;
    players: Player[];
    bookings: {
        id: number;
        code: string;
        gameId: number;
        game: {
            name: string;
        };
        createdAt: string;
        expiresAt: string | null;
    }[];
};

type TeamsResponse = {
    teams: TeamWithRelations[];
};

export default function TeamsPage() {
    const [teams, setTeams] = useState<TeamWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinGameTeam, setJoinGameTeam] = useState<{ code: string } | null>(null);

    async function fetchTeams() {
        try {
            const response = await fetch('/api/teams');
            if (!response.ok) throw new Error('Failed to fetch teams');
            const data = await response.json() as TeamsResponse;
            setTeams(data.teams);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load teams",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchTeams();
    }, []);

    const handleDeleteTeam = async (teamId: number) => {
        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete team');

            // Update the UI
            setTeams(teams.filter(team => team.id !== teamId));
        } catch (error) {
            console.error('Error deleting team:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete team",
            });
        }
    };

    if (loading) {
        return <div>Loading teams...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                    <p className="text-slate-400">Manage your game teams.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/teams/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Team
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                    <Card key={team.id} className="border-slate-800 bg-slate-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">
                                {team.name}
                            </CardTitle>
                            <Users className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-slate-400">Current Game</div>
                                    <div>
                                        {team.bookings.length > 0
                                            ? team.bookings[team.bookings.length - 1]?.game?.name
                                            : "No active game"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Latest Booking Code</div>
                                    <div className="font-mono">
                                        {team.bookings.length > 0
                                            ? team.bookings[team.bookings.length - 1]?.code
                                            : "No bookings"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Players</div>
                                    <div className="space-y-1">
                                        {team.players.map((player) => (
                                            <div key={player.id} className="text-sm">
                                                {player.name} ({player.email})
                                                {player.isTeamLeader && " 👑"}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/admin/teams/${team.id}`}>
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteTeam(team.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <JoinGameDialog
                open={!!joinGameTeam}
                onOpenChange={(open) => !open && setJoinGameTeam(null)}
                teamCode={joinGameTeam?.code ?? ""}
                onSuccess={() => {
                    void fetchTeams();
                }}
            />
        </div>
    );
} 