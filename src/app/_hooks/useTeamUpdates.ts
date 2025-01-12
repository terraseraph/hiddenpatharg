"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface TeamUpdate {
    currentPuzzleId: number | null;
    timestamp: string;
}

export function useTeamUpdates(teamId: number) {
    const router = useRouter();

    useEffect(() => {
        const eventSource = new EventSource(`/api/teams/${teamId}/updates`);

        eventSource.onmessage = (event: MessageEvent<string>) => {
            const data = JSON.parse(event.data) as TeamUpdate;
            router.refresh();
        };

        eventSource.onerror = (error) => {
            console.error("SSE error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [teamId, router]);
} 