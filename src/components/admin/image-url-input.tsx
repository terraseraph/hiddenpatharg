"use client";

import { useState } from "react";
import Image from "next/image";

function ImagePreview({ url }: { url: string }) {
    const [error, setError] = useState(false);

    if (!url || error) return null;

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-800">
            <Image
                src={url}
                alt="Puzzle image preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setError(true)}
            />
        </div>
    );
}

export function ImageUrlInput({
    name,
    defaultValue,
    placeholder = "https://...",
    className = "mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
}: {
    name: string;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
}) {
    const [url, setUrl] = useState(defaultValue ?? "");

    return (
        <div className="space-y-2">
            <input
                type="text"
                name={name}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={placeholder}
                className={className}
            />
            <ImagePreview url={url} />
        </div>
    );
} 