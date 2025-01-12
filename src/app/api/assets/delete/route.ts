import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const filePath = formData.get("path") as string;

        if (!filePath) {
            return NextResponse.json(
                { error: "No file path provided" },
                { status: 400 }
            );
        }

        // Security check: ensure the file is within our assets directory
        const assetsDir = path.join(process.cwd(), "public", "assets");
        const normalizedPath = path.normalize(filePath);

        if (!normalizedPath.startsWith(assetsDir)) {
            return NextResponse.json(
                { error: "Invalid file path" },
                { status: 400 }
            );
        }

        await unlink(normalizedPath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Error deleting file" },
            { status: 500 }
        );
    }
} 