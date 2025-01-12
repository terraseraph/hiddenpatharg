import { notFound, redirect } from "next/navigation";
import { prisma } from "~/server/db";
import { PuzzleType, type PuzzleInputProps } from "~/types/puzzle";
import { ImageUrlInput } from "~/components/admin/image-url-input";

async function updateGame(id: number, formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await prisma.game.update({
        where: { id },
        data: {
            name,
            description,
        },
    });

    redirect("/admin/games");
}

async function updatePuzzle(puzzleId: number, formData: FormData) {
    "use server";

    const type = formData.get("type") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const locationData = formData.get("locationData") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const choices = formData.get("choices") as string;

    await prisma.puzzle.update({
        where: { id: puzzleId },
        data: {
            type,
            question,
            answer,
            locationData: locationData || null,
            imageUrl: imageUrl || null,
            choices: choices || null,
        },
    });
}

async function reorderPuzzle(puzzleId: number, direction: "up" | "down") {
    "use server";

    const puzzle = await prisma.puzzle.findUnique({
        where: { id: puzzleId },
        include: {
            game: {
                include: {
                    puzzles: {
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    });

    if (!puzzle) return;

    const currentIndex = puzzle.game.puzzles.findIndex(p => p.id === puzzleId);
    if (direction === "up" && currentIndex > 0) {
        const prevPuzzle = puzzle.game.puzzles[currentIndex - 1];
        if (!prevPuzzle) return;

        await prisma.$transaction([
            prisma.puzzle.update({
                where: { id: puzzle.id },
                data: { order: prevPuzzle.order },
            }),
            prisma.puzzle.update({
                where: { id: prevPuzzle.id },
                data: { order: puzzle.order },
            }),
        ]);
    } else if (direction === "down" && currentIndex < puzzle.game.puzzles.length - 1) {
        const nextPuzzle = puzzle.game.puzzles[currentIndex + 1];
        if (!nextPuzzle) return;

        await prisma.$transaction([
            prisma.puzzle.update({
                where: { id: puzzle.id },
                data: { order: nextPuzzle.order },
            }),
            prisma.puzzle.update({
                where: { id: nextPuzzle.id },
                data: { order: puzzle.order },
            }),
        ]);
    }
}

async function addPuzzle(gameId: number, formData: FormData) {
    "use server";

    const type = formData.get("type") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const locationData = formData.get("locationData") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const choices = formData.get("choices") as string;

    const lastPuzzle = await prisma.puzzle.findFirst({
        where: { gameId },
        orderBy: { order: "desc" },
    });

    await prisma.puzzle.create({
        data: {
            gameId,
            type,
            question,
            answer,
            locationData: locationData || null,
            imageUrl: imageUrl || null,
            choices: choices || null,
            order: (lastPuzzle?.order ?? 0) + 1,
        },
    });

    redirect(`/admin/games/${gameId}`);
}

export default async function EditGamePage({
    params,
}: {
    params: { id: string };
}) {
    const gameId = parseInt(params.id);
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            puzzles: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!game) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Edit Game: {game.name}</h1>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-semibold mb-4">Game Details</h2>
                <form action={updateGame.bind(null, gameId)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-200">
                            Game Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            defaultValue={game.name}
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-200">
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            required
                            defaultValue={game.description}
                            rows={4}
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Update Game
                    </button>
                </form>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-xl font-semibold mb-4">Puzzles</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Add New Puzzle</h3>
                    <form action={addPuzzle.bind(null, gameId)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-slate-200">
                                    Puzzle Type
                                </label>
                                <select
                                    name="type"
                                    id="type"
                                    required
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={PuzzleType.INPUT}>Text Input</option>
                                    <option value={PuzzleType.MULTIPLE_CHOICE}>Multiple Choice</option>
                                    <option value={PuzzleType.QRCODE}>QR Code</option>
                                    <option value={PuzzleType.IMAGE}>Image</option>
                                    <option value={PuzzleType.LOCATION}>Location Based</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="locationData" className="block text-sm font-medium text-slate-200">
                                    Location Data (optional)
                                </label>
                                <input
                                    type="text"
                                    name="locationData"
                                    id="locationData"
                                    placeholder="Location instructions"
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-200">
                                    Image URL (optional)
                                </label>
                                <ImageUrlInput name="imageUrl" />
                            </div>

                            <div>
                                <label htmlFor="choices" className="block text-sm font-medium text-slate-200">
                                    Multiple Choice Options (optional)
                                </label>
                                <input
                                    type="text"
                                    name="choices"
                                    id="choices"
                                    placeholder='[{"id":"a","text":"Option A"},...]'
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="question" className="block text-sm font-medium text-slate-200">
                                Question/Instructions
                            </label>
                            <textarea
                                name="question"
                                id="question"
                                required
                                rows={2}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="answer" className="block text-sm font-medium text-slate-200">
                                Answer
                            </label>
                            <input
                                type="text"
                                name="answer"
                                id="answer"
                                required
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Add Puzzle
                        </button>
                    </form>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Existing Puzzles</h3>
                    <div className="space-y-4">
                        {game.puzzles.map((puzzle, index) => (
                            <div key={puzzle.id} className="border border-slate-700 rounded bg-slate-800/50 p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <form action={updatePuzzle.bind(null, puzzle.id)} className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-400">
                                                    #{index + 1}
                                                </span>
                                                <select
                                                    name="type"
                                                    defaultValue={puzzle.type}
                                                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200"
                                                >
                                                    <option value="input">Text Input</option>
                                                    <option value="multiple_choice">Multiple Choice</option>
                                                    <option value="qrcode">QR Code</option>
                                                    <option value="image">Image</option>
                                                    <option value="location">Location Based</option>
                                                </select>
                                            </div>

                                            <div>
                                                <textarea
                                                    name="question"
                                                    defaultValue={puzzle.question}
                                                    required
                                                    rows={2}
                                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 text-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <input
                                                        type="text"
                                                        name="answer"
                                                        defaultValue={puzzle.answer}
                                                        required
                                                        placeholder="Answer"
                                                        className="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        name="locationData"
                                                        defaultValue={puzzle.locationData ?? ""}
                                                        placeholder="Location Data (optional)"
                                                        className="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <ImageUrlInput
                                                        name="imageUrl"
                                                        defaultValue={puzzle.imageUrl ?? ""}
                                                        placeholder="Image URL (optional)"
                                                        className="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        name="choices"
                                                        defaultValue={puzzle.choices ?? ""}
                                                        placeholder='[{"id":"a","text":"Option A"},...]'
                                                        className="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="space-x-2">
                                                    <button
                                                        type="submit"
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                        <div className="flex gap-1 mt-2">
                                            <form action={reorderPuzzle.bind(null, puzzle.id, "up")}>
                                                <button
                                                    type="submit"
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                                                >
                                                    ↑
                                                </button>
                                            </form>
                                            <form action={reorderPuzzle.bind(null, puzzle.id, "down")}>
                                                <button
                                                    type="submit"
                                                    disabled={index === game.puzzles.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                                                >
                                                    ↓
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 