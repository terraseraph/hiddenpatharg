"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "~/hooks/use-toast";

interface Player {
    name: string;
    email: string;
    phone: string | null;
    isTeamLeader: boolean;
    details: Record<string, unknown> | null;
}

export default function NewTeam() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState<Player[]>([
        { name: "", email: "", phone: null, isTeamLeader: false, details: null }
    ]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const teamName = formData.get("teamName") as string;

            // Collect all player data
            const players = Array.from({ length: formData.getAll("playerName").length }, (_, index) => ({
                name: formData.getAll("playerName")[index] as string,
                email: formData.getAll("playerEmail")[index] as string,
                phone: formData.getAll("playerPhone")[index] as string || null,
                isTeamLeader: formData.getAll("isTeamLeader")[index] === "on",
                details: null,
            })).filter(player => player.name.trim() && player.email.trim());

            const response = await fetch("/api/teams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: teamName,
                    players,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create team");
            }

            const data = await response.json();
            toast({
                title: "Success",
                description: "Team created successfully!",
            });
            router.push("/admin/teams");
            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create team. Please try again.",
            });
            console.error("Error creating team:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
                <p className="text-slate-400">Create a new team and add players.</p>
            </div>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input
                                id="teamName"
                                name="teamName"
                                placeholder="Enter team name"
                                required
                                className="bg-slate-950"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Players</Label>
                            <div className="space-y-4">
                                {players.map((player, index) => (
                                    <div key={index} className="space-y-4 p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`player-${index}-name`}>Name</Label>
                                                <Input
                                                    id={`player-${index}-name`}
                                                    name="playerName"
                                                    defaultValue={player.name}
                                                    required={index === 0}
                                                    className="bg-slate-950"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`player-${index}-email`}>Email</Label>
                                                <Input
                                                    id={`player-${index}-email`}
                                                    name="playerEmail"
                                                    type="email"
                                                    defaultValue={player.email}
                                                    required={index === 0}
                                                    className="bg-slate-950"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`player-${index}-phone`}>Phone (optional)</Label>
                                                <Input
                                                    id={`player-${index}-phone`}
                                                    name="playerPhone"
                                                    type="tel"
                                                    defaultValue={player.phone ?? ""}
                                                    className="bg-slate-950"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`player-${index}-leader`}
                                                        name="isTeamLeader"
                                                        defaultChecked={player.isTeamLeader}
                                                    />
                                                    <Label
                                                        htmlFor={`player-${index}-leader`}
                                                        className="font-normal"
                                                    >
                                                        Team Leader
                                                    </Label>
                                                </div>
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setPlayers(players.filter((_, i) => i !== index));
                                                        }}
                                                        className="h-8"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setPlayers([...players, { name: "", email: "", phone: null, isTeamLeader: false, details: null }]);
                                    }}
                                    className="w-full"
                                >
                                    Add Player
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Team"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 