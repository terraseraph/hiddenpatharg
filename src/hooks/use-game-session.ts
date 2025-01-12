import { useEffect, useState } from "react";

interface GameSession {
    code: string;
    currentPuzzleId?: number;
    startTime?: string;
}

export function useGameSession(code: string) {
    const [session, setSession] = useState<GameSession | null>(null);

    useEffect(() => {
        // Load session from localStorage
        const savedSession = localStorage.getItem(`game-session-${code}`);
        if (savedSession) {
            setSession(JSON.parse(savedSession) as GameSession);
        } else {
            // Initialize new session
            const newSession = {
                code,
                startTime: new Date().toISOString(),
            };
            setSession(newSession);
            localStorage.setItem(`game-session-${code}`, JSON.stringify(newSession));
        }
    }, [code]);

    const updateSession = (updates: Partial<GameSession>) => {
        setSession((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            localStorage.setItem(`game-session-${code}`, JSON.stringify(updated));
            return updated;
        });
    };

    const clearSession = () => {
        localStorage.removeItem(`game-session-${code}`);
        setSession(null);
    };

    return {
        session,
        updateSession,
        clearSession,
    };
} 