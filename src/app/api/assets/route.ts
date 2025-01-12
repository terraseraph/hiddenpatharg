import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface AssetFile {
    name: string;
    path: string;
    type: "image" | "audio" | "video";
    size: number;
    modified: string;
    url: string;
}

export async function GET() {
    try {
        const assetTypes = ["image", "audio", "video"];
        const assets: AssetFile[] = [];

        for (const assetType of assetTypes) {
            const dir = path.join(process.cwd(), "public", "assets", assetType);
            try {
                const files = await fs.readdir(dir);

                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = await fs.stat(filePath);

                    if (stats.isFile()) {
                        assets.push({
                            name: file,
                            path: filePath,
                            type: assetType as "image" | "audio" | "video",
                            size: stats.size,
                            modified: stats.mtime.toISOString(),
                            url: `/assets/${assetType}/${file}`,
                        });
                    }
                }
            } catch (error) {
                console.error(`Error reading ${assetType} directory:`, error);
            }
        }

        return NextResponse.json({ assets });
    } catch (error) {
        console.error("Error fetching assets:", error);
        return NextResponse.json(
            { error: "Error fetching assets" },
            { status: 500 }
        );
    }
} 