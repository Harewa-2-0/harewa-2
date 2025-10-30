export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { uploadSingleFile } from "@/lib/upload";
import { ok } from "@/lib/response";
import { Profile } from "@/lib/models/Profile";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/middleware/requireAuth";
// import { User } from "@/lib/models/User";

export async function POST(request: NextRequest) {
    try {
        const decoded = requireAuth(request);
        await dbConnect();

        // Get FormData from the request
        const formData = await request.formData();

        // Extract folder and file from FormData
        const folder = (formData.get('folder') as string) || 'profile-pictures';
        const uploadedFile = formData.get('file') as File;

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
        console.log('Upload result:', uploadResult);
        // update profile picture in the database 
        const { secure_url } = uploadResult as { secure_url: string };
        const profilePictureUrl = secure_url;
        const Update = await Profile.findOneAndUpdate(
            { user: decoded.sub },
            { profilePicture: profilePictureUrl },
            { new: true }
        );
        return ok(Update)

    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ error: 'Upload failed' }, { status: 500 });
    }
}