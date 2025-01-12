export enum PuzzleType {
    INPUT = "input",
    MULTIPLE_CHOICE = "multiple_choice",
    QRCODE = "qrcode",
    IMAGE = "image",
    LOCATION = "location"
}

export interface PuzzleChoice {
    id: string;
    text: string;
}

export interface Puzzle {
    id: number;
    order: number;
    question: string;
    type: PuzzleType;
    choices?: PuzzleChoice[];
    locationData?: string;
    imageUrl?: string;
}

export interface PuzzleInputProps {
    puzzle: Puzzle;
    onSubmit: (answer: string) => void;
    disabled?: boolean;
}

// Base interface for all puzzle components
export interface BasePuzzleProps {
    puzzle: Puzzle;
    onSubmit: (answer: string) => void;
    disabled?: boolean;
} 