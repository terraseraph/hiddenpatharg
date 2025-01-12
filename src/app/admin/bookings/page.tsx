"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { type Game, type Team } from "@prisma/client";

interface BookingWithRelations {
    id: number;
    teamId: number;
    gameId: number;
    code: string;
    createdAt: Date;
    startTime: Date | null;
    expiresAt: Date | null;
    voucher: string | null;
    paid: boolean;
    notes: string | null;
    team: Pick<Team, "id" | "name">;
    game: Pick<Game, "id" | "name">;
    instance: {
        startedAt: Date | null;
        completedAt: Date | null;
        currentPuzzleOrder: number | null;
    } | null;
}

interface ApiResponse {
    bookings: BookingWithRelations[];
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await fetch('/api/bookings');
                if (!response.ok) throw new Error('Failed to fetch bookings');
                const data = await response.json() as ApiResponse;
                setBookings(data.bookings);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load bookings",
                });
            } finally {
                setLoading(false);
            }
        }

        void fetchBookings();
    }, [toast]);

    async function handleDelete(code: string) {
        if (!confirm('Are you sure you want to delete this booking?')) {
            return;
        }

        setDeleting(code);
        try {
            const response = await fetch(`/api/bookings/${code}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            setBookings(bookings.filter(b => b.code !== code));
            toast({
                title: "Success",
                description: "Booking deleted successfully",
            });
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete booking",
            });
        } finally {
            setDeleting(null);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Bookings</h1>
                <Link
                    href="/admin/bookings/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create New Booking
                </Link>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="text-left p-4 text-slate-200">Code</th>
                            <th className="text-left p-4 text-slate-200">Team</th>
                            <th className="text-left p-4 text-slate-200">Game</th>
                            <th className="text-center p-4 text-slate-200">Status</th>
                            <th className="text-center p-4 text-slate-200">Start Time</th>
                            <th className="text-center p-4 text-slate-200">Expires</th>
                            <th className="text-center p-4 text-slate-200">Paid</th>
                            <th className="text-center p-4 text-slate-200">Voucher</th>
                            <th className="text-right p-4 text-slate-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="p-4">
                                    <span className="font-mono text-slate-200">{booking.code}</span>
                                    {booking.notes && (
                                        <div className="text-sm text-slate-400 mt-1">{booking.notes}</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <Link
                                        href={`/admin/teams/${booking.team.id}`}
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        {booking.team.name}
                                    </Link>
                                </td>
                                <td className="p-4">
                                    <Link
                                        href={`/admin/games/${booking.game.id}`}
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        {booking.game.name}
                                    </Link>
                                </td>
                                <td className="p-4 text-center">
                                    {booking.instance ? (
                                        booking.instance.completedAt ? (
                                            <span className="text-green-400">Completed</span>
                                        ) : (
                                            <span className="text-yellow-400">In Progress</span>
                                        )
                                    ) : (
                                        <span className="text-slate-400">Not Started</span>
                                    )}
                                </td>
                                <td className="p-4 text-center text-slate-400">
                                    {booking.startTime ? (
                                        new Date(booking.startTime).toLocaleString()
                                    ) : (
                                        <span className="text-slate-500">Not Set</span>
                                    )}
                                </td>
                                <td className="p-4 text-center text-slate-400">
                                    {booking.expiresAt ? (
                                        new Date(booking.expiresAt).toLocaleString()
                                    ) : (
                                        <span className="text-slate-500">Never</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    {booking.paid ? (
                                        <span className="text-green-400">Yes</span>
                                    ) : (
                                        <span className="text-red-400">No</span>
                                    )}
                                </td>
                                <td className="p-4 text-center text-slate-400">
                                    {booking.voucher ?? <span className="text-slate-500">None</span>}
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/admin/bookings/${booking.code}`}
                                        className="text-blue-400 hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => void handleDelete(booking.code)}
                                        disabled={deleting === booking.code}
                                        className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deleting === booking.code ? 'Deleting...' : 'Delete'}
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