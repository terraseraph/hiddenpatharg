"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Trophy, Clock, ArrowLeft } from "lucide-react";
import { Loading } from "~/components/ui/loading";
import { useGameSession } from "~/hooks/use-game-session";

interface GameInstance {
    startedAt: string;
    completedAt: string;
}

interface TeamData {
    id: number;
    name: string;
}

interface GameData {
    id: number;
    name: string;
    puzzles: {
        id: number;
        title: string;
    }[];
}

interface ApiResponse {
    team: TeamData;
    game: GameData;
    instance: GameInstance;
}

interface Props {
    params: {
        code: string;
    };
}

export default function CompletePage({ params }: Props) {
    const [team, setTeam] = useState<TeamData | null>(null);
    const [game, setGame] = useState<GameData | null>(null);
    const [instance, setInstance] = useState<GameInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { clearSession } = useGameSession(params.code);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/bookings/${params.code}`);
                if (!response.ok) throw new Error("Failed to fetch game data");

                const data = (await response.json()) as ApiResponse;
                setTeam(data.team);
                setGame(data.game);
                setInstance(data.instance);

                // Clear the game session as we're done
                clearSession();
            } catch (error) {
                console.error("Error fetching data:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, [params.code, router, clearSession]);

    if (loading || !team || !game || !instance) {
        return <Loading message="Loading completion stats..." />;
    }

    // Calculate completion time
    const startTime = new Date(instance.startedAt);
    const endTime = new Date(instance.completedAt);
    const timeTaken = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(timeTaken / (1000 * 60 * 60));
    const minutes = Math.floor((timeTaken % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeTaken % (1000 * 60)) / 1000);

    return (
        <div className="container max-w-2xl py-8">
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="text-center">
                    <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <CardTitle className="text-3xl">Congratulations!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold">{team.name}</h2>
                        <p className="text-slate-400">
                            You&apos;ve completed {game.name}!
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <Clock className="h-5 w-5" />
                            <span>
                                Completion Time: {hours}h {minutes}m {seconds}s
                            </span>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="font-semibold">Game Statistics</h3>
                            <ul className="text-slate-400">
                                <li>Total Puzzles Solved: {game.puzzles.length}</li>
                                <li>Started: {new Date(instance.startedAt).toLocaleString()}</li>
                                <li>Completed: {new Date(instance.completedAt).toLocaleString()}</li>
                            </ul>
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push("/")}
                        className="w-full group"
                        variant="secondary"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Return Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
} 