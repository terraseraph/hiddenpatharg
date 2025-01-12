import { type ReactNode } from "react";

export default function PlayerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen">
            <header className="bg-slate-900 text-white p-4 border-b border-slate-800">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">ARG Game</h1>
                </div>
            </header>
            <main className="container mx-auto p-4">
                {children}
            </main>
        </div>
    );
} 