"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";

interface AssetFile {
    name: string;
    path: string;
    type: "image" | "audio" | "video";
    size: number;
    modified: string;
    url: string;
}

interface AssetsResponse {
    assets: AssetFile[];
}

interface UploadResponse {
    success: boolean;
    file: {
        name: string;
        type: string;
        url: string;
    };
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<AssetFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState<string>("image");
    const { toast } = useToast();

    const fetchAssets = useCallback(async () => {
        try {
            const response = await fetch("/api/assets");
            if (!response.ok) throw new Error("Failed to fetch assets");
            const data = (await response.json()) as AssetsResponse;
            setAssets(data.assets);
        } catch (error) {
            console.error("Error fetching assets:", error);
            toast({
                title: "Error",
                description: "Failed to fetch assets",
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        void fetchAssets();
    }, [fetchAssets]);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (uploading) return;

        const form = e.currentTarget;
        const formData = new FormData(form);
        const file = formData.get("file") as File;

        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file to upload",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        try {
            const response = await fetch("/api/assets/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload file");

            const data = (await response.json()) as UploadResponse;
            toast({
                title: "Success",
                description: "File uploaded successfully",
            });
            void fetchAssets();
            form.reset();
        } catch (error) {
            console.error("Error uploading file:", error);
            toast({
                title: "Error",
                description: "Failed to upload file",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (path: string) => {
        try {
            const formData = new FormData();
            formData.append("path", path);

            const response = await fetch("/api/assets/delete", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to delete file");

            toast({
                title: "Success",
                description: "File deleted successfully",
            });
            void fetchAssets();
        } catch (error) {
            console.error("Error deleting file:", error);
            toast({
                title: "Error",
                description: "Failed to delete file",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Assets</h1>
                <form onSubmit={handleUpload} className="flex items-center gap-4">
                    <Select
                        name="type"
                        value={selectedType}
                        onValueChange={setSelectedType}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Asset Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="file"
                        name="file"
                        accept={`${selectedType}/*`}
                        className="w-64"
                        disabled={uploading}
                    />
                    <Button type="submit" disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>
                </form>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Preview</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Modified</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.map((file) => (
                            <TableRow key={file.path}>
                                <TableCell>
                                    {file.type === "image" && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    {file.type === "audio" && (
                                        <audio src={file.url} controls className="w-16 h-16" />
                                    )}
                                    {file.type === "video" && (
                                        <video src={file.url} className="w-16 h-16 object-cover rounded" />
                                    )}
                                </TableCell>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{file.type}</TableCell>
                                <TableCell>{formatFileSize(file.size)}</TableCell>
                                <TableCell>{new Date(file.modified).toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                void navigator.clipboard.writeText(file.url);
                                                toast({
                                                    title: "Copied",
                                                    description: "URL copied to clipboard",
                                                });
                                            }}
                                        >
                                            Copy URL
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => void handleDelete(file.path)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
} 