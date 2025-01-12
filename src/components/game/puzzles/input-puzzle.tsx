import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type BasePuzzleProps } from "~/types/puzzle";

export function InputPuzzle({ puzzle, onSubmit, disabled }: BasePuzzleProps) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!answer.trim() || disabled) return;

        onSubmit(answer.trim());
        setAnswer("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Input
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={disabled}
                    required
                />
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={disabled ?? !answer.trim()}
            >
                {disabled ? "Checking..." : "Submit Answer"}
            </Button>
        </form>
    );
} 