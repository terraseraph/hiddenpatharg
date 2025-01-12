export interface Player {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    isTeamLeader: boolean;
    details: Record<string, unknown> | null;
}

export interface Team {
    id: number;
    name: string;
    players: Player[];
    bookings: Array<{
        id: number;
        code: string;
        createdAt: string;
        expiresAt: string | null;
        game: {
            id: number;
            name: string;
        };
        instance: {
            id: number;
            startedAt: string;
            completedAt: string | null;
            currentPuzzleOrder: number;
        } | null;
    }>;
} 