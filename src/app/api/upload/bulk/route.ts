export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { uploaded } from "@/lib/response";
import { uploadMultipleFiles } from "@/lib/upload";
// import fs from 'fs';

// Version 1: For FormData file uploads
export async function POST(request: NextRequest) {
    try {
        // Get FormData from the request (for file uploads)
        const formData = await request.formData();

        // Extract files from FormData
        const folder = formData.get('folder') as string || 'products';
        const uploadedFiles = formData.getAll('files') as File[];

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return Response.json({ error: 'No files provided' }, { status: 400 });
        }

        // Generate random filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const filename = `file_${timestamp}_${randomString}`;

        // Convert File objects to buffer format for uploadMultipleFiles
        const fileBuffers = await Promise.all(
            uploadedFiles.map(async (file, index) => ({
                buffer: Buffer.from(await file.arrayBuffer()),
                filename: filename || `file${index + 1}`,
            }))
        );

        // Upload multiple files
        const bulkUpload = await uploadMultipleFiles(fileBuffers, folder, 'auto');

        return uploaded(bulkUpload);

    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ error: 'Upload failed' }, { status: 500 });
    }
}
