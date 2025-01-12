import Link from "next/link";
import { prisma } from "~/server/db";

export default async function GamesPage() {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    puzzles: true,
                    bookings: true,
                },
            },
        },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Games</h1>
                <Link
                    href="/admin/games/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create New Game
                </Link>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left p-4 text-slate-200">Name</th>
                            <th className="text-left p-4 text-slate-200">Description</th>
                            <th className="text-center p-4 text-slate-200">Puzzles</th>
                            <th className="text-center p-4 text-slate-200">Bookings</th>
                            <th className="text-right p-4 text-slate-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((game) => (
                            <tr key={game.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="p-4 text-slate-200">{game.name}</td>
                                <td className="p-4 text-slate-400">{game.description}</td>
                                <td className="p-4 text-center text-slate-200">{game._count.puzzles}</td>
                                <td className="p-4 text-center text-slate-200">{game._count.bookings}</td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/admin/games/${game.id}`}
                                        className="text-blue-400 hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="text-red-400 hover:text-red-300"
                                    // We'll implement delete functionality later
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 