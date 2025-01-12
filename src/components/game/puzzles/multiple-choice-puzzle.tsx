import { useState } from "react";
import { Button } from "~/components/ui/button";
import { type BasePuzzleProps } from "~/types/puzzle";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";

export function MultipleChoicePuzzle({ puzzle, onSubmit, disabled }: BasePuzzleProps) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!answer || disabled) return;

        onSubmit(answer);
        setAnswer("");
    };

    if (!puzzle.choices?.length) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
                value={answer}
                onValueChange={setAnswer}
                className="space-y-3"
                disabled={disabled}
            >
                {puzzle.choices.map((choice) => (
                    <div key={choice.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={choice.id} id={choice.id} />
                        <Label htmlFor={choice.id}>{choice.text}</Label>
                    </div>
                ))}
            </RadioGroup>

            <Button
                type="submit"
                className="w-full"
                disabled={disabled ?? !answer}
            >
                {disabled ? "Checking..." : "Submit Answer"}
            </Button>
        </form>
    );
} 