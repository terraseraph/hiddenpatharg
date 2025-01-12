"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "~/hooks/use-toast";
import type { Game } from "@prisma/client";

interface JoinGameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamCode: string;
    onSuccess?: () => void;
}

type GamesResponse = {
    games: Pick<Game, "id" | "name">[];
};

type JoinGameError = {
    error: string;
};

export function JoinGameDialog({ open, onOpenChange, teamCode, onSuccess }: JoinGameDialogProps) {
    const [loading, setLoading] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<string>("");
    const [games, setGames] = useState<Pick<Game, "id" | "name">[]>([]);

    useEffect(() => {
        async function fetchGames() {
            if (!open) return;

            try {
                const response = await fetch('/api/games');
                if (!response.ok) throw new Error('Failed to fetch games');
                const data = (await response.json()) as GamesResponse;
                setGames(data.games);
            } catch (error) {
                console.error('Error fetching games:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load available games",
                });
            }
        }

        void fetchGames();
    }, [open]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/teams/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamCode,
                    gameId: parseInt(selectedGameId),
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json()) as JoinGameError;
                throw new Error(errorData.error || 'Failed to join game');
            }

            toast({
                title: "Success",
                description: "Team has joined the game",
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error joining game:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to join game",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join Game</DialogTitle>
                    <DialogDescription>
                        Select a game for this team to join.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Team Code</Label>
                            <Input
                                value={teamCode}
                                disabled
                                className="bg-slate-950"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Select Game</Label>
                            <Select
                                value={selectedGameId}
                                onValueChange={setSelectedGameId}
                            >
                                <SelectTrigger className="bg-slate-950">
                                    <SelectValue placeholder="Select a game" />
                                </SelectTrigger>
                                <SelectContent>
                                    {games.map((game) => (
                                        <SelectItem
                                            key={game.id}
                                            value={game.id.toString()}
                                        >
                                            {game.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedGameId}
                        >
                            {loading ? "Joining..." : "Join Game"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 