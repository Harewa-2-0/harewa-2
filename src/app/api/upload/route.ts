import { NextRequest } from "next/server";
import { uploadSingleFile } from "@/lib/upload";
import { uploaded } from "@/lib/response";

export async function POST(request: NextRequest) {
    try {
        // Get FormData from the request
        const formData = await request.formData();

        // Extract folder and file from FormData
        const folder = (formData.get('folder') as string) || 'products';
        const uploadedFile = formData.get('files') as File;

        // Check if file exists
        if (!uploadedFile) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const buffer = Buffer.from(await uploadedFile.arrayBuffer());
        // Generate random filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const filename = `file_${timestamp}_${randomString}`;

        // Upload single file
        const uploadResult = await uploadSingleFile(buffer, filename, folder, 'auto');

        return uploaded(uploadResult);

    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ error: 'Upload failed' }, { status: 500 });
    }
}