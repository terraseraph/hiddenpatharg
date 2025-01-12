interface ProgressBarProps {
    currentPuzzle: number;
    totalPuzzles: number;
}

export function ProgressBar({ currentPuzzle, totalPuzzles }: ProgressBarProps) {
    const progress = (currentPuzzle / totalPuzzles) * 100;

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{currentPuzzle} of {totalPuzzles} puzzles</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
} 