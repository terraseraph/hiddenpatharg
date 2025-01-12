import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type BasePuzzleProps } from "~/types/puzzle";
import Image from "next/image";

export function ImagePuzzle({ puzzle, onSubmit, disabled }: BasePuzzleProps) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!answer.trim() || disabled) return;

        onSubmit(answer.trim());
        setAnswer("");
    };

    if (!puzzle.imageUrl) return null;

    return (
        <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                    src={puzzle.imageUrl}
                    alt="Puzzle Image"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={disabled}
                    required
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={disabled ?? !answer.trim()}
                >
                    {disabled ? "Checking..." : "Submit Answer"}
                </Button>
            </form>
        </div>
    );
} 