"use client";

import { useEffect, useState, use } from "react";
import { notFound, useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { TeamForm, type Player } from "~/components/team-form";

interface Props {
    params: Promise<{
        teamId: string;
    }>;
}

interface Team {
    id: number;
    name: string;
    players: Player[];
}

type TeamResponse = {
    team: Team;
};

interface ErrorResponse {
    error: string;
}

export default function EditTeamPage({ params }: Props) {
    const resolvedParams = use(params) as { teamId: string };
    const teamId = parseInt(resolvedParams.teamId);
    if (isNaN(teamId)) {
        notFound();
    }
    return <EditTeamPageContent teamId={teamId} />;
}

function EditTeamPageContent({ teamId }: { teamId: number }) {
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (isNaN(teamId)) {
            notFound();
            return;
        }

        async function fetchData() {
            try {
                const teamResponse = await fetch(`/api/teams/${teamId}`);
                if (!teamResponse.ok) throw new Error('Failed to fetch team');
                const teamData = await teamResponse.json() as TeamResponse;
                setTeam(teamData.team);
            } catch (error) {
                console.error('Error fetching data:', error);
                notFound();
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, [teamId]);

    if (loading) {
        return <div>Loading team...</div>;
    }

    if (!team) {
        return null;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
                <p className="text-slate-400">Update team details and manage players.</p>
            </div>

            <TeamForm
                defaultValues={{
                    name: team.name,
                    players: team.players,
                }}
                onSubmit={async (data) => {
                    setSubmitting(true);
                    try {
                        const response = await fetch(`/api/teams/${teamId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        });

                        if (!response.ok) {
                            const errorData = await response.json() as ErrorResponse;
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
                    } finally {
                        setSubmitting(false);
                    }
                }}
                isSubmitting={submitting}
            />
        </div>
    );
} 