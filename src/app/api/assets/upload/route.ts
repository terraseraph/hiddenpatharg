import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        if (!["image", "audio", "video"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid asset type" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create directory if it doesn't exist
        const dir = path.join(process.cwd(), "public", "assets", type);
        await mkdir(dir, { recursive: true });
        const filePath = path.join(dir, file.name);

        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            file: {
                name: file.name,
                type,
                url: `/assets/${type}/${file.name}`,
            }
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Error uploading file" },
            { status: 500 }
        );
    }
} 