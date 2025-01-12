"use client";

import { useState } from "react";

interface LoginFormProps {
    loginWithCode: (formData: FormData) => Promise<{ error: string } | undefined>;
}

export default function LoginForm({ loginWithCode }: LoginFormProps) {
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        const result = await loginWithCode(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-4 rounded bg-red-50 text-red-800">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Team Code
                </label>
                <input
                    type="text"
                    name="code"
                    id="code"
                    required
                    placeholder="Enter your team code"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Start Playing
            </button>
        </form>
    );
} 