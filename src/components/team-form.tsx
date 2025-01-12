"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

export interface Player {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    isTeamLeader: boolean;
    details: Record<string, unknown> | null;
}

interface TeamFormProps {
    defaultValues?: {
        name: string;
        players: Player[];
    };
    onSubmit: (data: { name: string; players: Player[] }) => Promise<void>;
    submitLabel?: string;
    isSubmitting?: boolean;
}

export function TeamForm({ defaultValues, onSubmit, submitLabel = "Save Changes", isSubmitting = false }: TeamFormProps) {
    const [players, setPlayers] = useState<Player[]>(defaultValues?.players ?? [{
        id: 1,
        name: "",
        email: "",
        phone: null,
        isTeamLeader: true,
        details: null,
    }]);

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const teamName = formData.get('teamName') as string;

                if (!teamName) {
                    throw new Error('Team name is required');
                }

                await onSubmit({
                    name: teamName,
                    players,
                });
            }}
            className="space-y-6"
        >
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                            id="teamName"
                            name="teamName"
                            defaultValue={defaultValues?.name}
                            required
                            className="bg-slate-950"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Players</Label>
                        <div className="space-y-4">
                            {players.map((player, index) => (
                                <div key={player.id} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex-1 min-w-[200px]">
                                            <Label htmlFor={`player-${index}-name`} className="sr-only">Name</Label>
                                            <Input
                                                id={`player-${index}-name`}
                                                value={player.name}
                                                onChange={(e) => {
                                                    const newPlayers = [...players];
                                                    if (newPlayers[index]) {
                                                        newPlayers[index].name = e.target.value;
                                                        setPlayers(newPlayers);
                                                    }
                                                }}
                                                placeholder="Player name"
                                                required
                                                className="bg-slate-950"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <Label htmlFor={`player-${index}-email`} className="sr-only">Email</Label>
                                            <Input
                                                id={`player-${index}-email`}
                                                type="email"
                                                value={player.email}
                                                onChange={(e) => {
                                                    const newPlayers = [...players];
                                                    if (newPlayers[index]) {
                                                        newPlayers[index].email = e.target.value;
                                                        setPlayers(newPlayers);
                                                    }
                                                }}
                                                placeholder="Email"
                                                required
                                                className="bg-slate-950"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <Label htmlFor={`player-${index}-phone`} className="sr-only">Phone</Label>
                                            <Input
                                                id={`player-${index}-phone`}
                                                type="tel"
                                                value={player.phone ?? ""}
                                                onChange={(e) => {
                                                    const newPlayers = [...players];
                                                    if (newPlayers[index]) {
                                                        newPlayers[index].phone = e.target.value || null;
                                                        setPlayers(newPlayers);
                                                    }
                                                }}
                                                placeholder="Phone"
                                                className="bg-slate-950"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`player-${index}-leader`}
                                                checked={player.isTeamLeader}
                                                onCheckedChange={(checked) => {
                                                    const newPlayers = [...players];
                                                    if (newPlayers[index]) {
                                                        newPlayers[index].isTeamLeader = checked === true;
                                                        setPlayers(newPlayers);
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor={`player-${index}-leader`}
                                                className="font-normal whitespace-nowrap"
                                            >
                                                Is team leader
                                            </Label>
                                        </div>
                                        {players.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => {
                                                    setPlayers(players.filter((_, i) => i !== index));
                                                }}
                                                className="h-8"
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setPlayers([
                                        ...players,
                                        {
                                            id: Math.random(),
                                            name: "",
                                            email: "",
                                            phone: null,
                                            isTeamLeader: false,
                                            details: null,
                                        }
                                    ]);
                                }}
                                className="w-full"
                            >
                                Add Player
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : submitLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
} 