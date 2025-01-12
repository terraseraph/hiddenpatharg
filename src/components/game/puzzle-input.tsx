import { PuzzleType, type PuzzleInputProps } from "~/types/puzzle";
import { InputPuzzle } from "./puzzles/input-puzzle";
import { MultipleChoicePuzzle } from "./puzzles/multiple-choice-puzzle";
import { QRCodePuzzle } from "./puzzles/qrcode-puzzle";
import { ImagePuzzle } from "./puzzles/image-puzzle";
import { LocationPuzzle } from "./puzzles/location-puzzle";

export function PuzzleInput({ puzzle, onSubmit, disabled }: PuzzleInputProps) {
    switch (puzzle.type) {
        case PuzzleType.MULTIPLE_CHOICE:
            return (
                <MultipleChoicePuzzle
                    puzzle={puzzle}
                    onSubmit={onSubmit}
                    disabled={disabled}
                />
            );
        case PuzzleType.QRCODE:
            return (
                <QRCodePuzzle
                    puzzle={puzzle}
                    onSubmit={onSubmit}
                    disabled={disabled}
                />
            );
        case PuzzleType.IMAGE:
            if (!puzzle.imageUrl) return <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} disabled={disabled} />;
            return (
                <ImagePuzzle
                    puzzle={puzzle}
                    onSubmit={onSubmit}
                    disabled={disabled}
                />
            );
        case PuzzleType.LOCATION:
            // if (!puzzle.locationData) return <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} disabled={disabled} />;
            return (
                <LocationPuzzle
                    puzzle={puzzle}
                    onSubmit={onSubmit}
                    disabled={disabled}
                />
            );
        case PuzzleType.INPUT:
        default:
            return <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} disabled={disabled} />;
    }
}

