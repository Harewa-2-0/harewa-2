import { Readable } from 'stream';
import cloudinary from './cloudinary'; // Adjust the import path as necessary

/**
 * Uploads a single file buffer to Cloudinary.
 * @param fileBuffer - The file buffer.
 * @param filename - Optional filename to use as public_id.
 * @param folder - Optional Cloudinary folder name.
 * @param resourceType - Defaults to 'auto'. Use 'raw' for PDFs or other binary data.
 */
export const uploadSingleFile = async (
    fileBuffer: Buffer,
    filename?: string,
    folder: string = '',
    resourceType: 'auto' | 'image' | 'raw' | 'video' = 'auto'
): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: filename,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        Readable.from(fileBuffer).pipe(stream);
    });
};

/**
 * Uploads multiple file buffers to Cloudinary.
 * @param files - An array of file buffers or objects with buffer and filename.
 * @param folder - Optional folder name in Cloudinary.
 * @param resourceType - Defaults to 'auto'. Use 'raw' for PDFs or other binary data.
 */
export const uploadMultipleFiles = async (
    files: { buffer: Buffer; filename?: string }[],
    folder: string = '',
    resourceType: 'auto' | 'image' | 'raw' | 'video' = 'auto'
): Promise<unknown[]> => {
    const uploadPromises = files.map((file) =>
        uploadSingleFile(file.buffer, file.filename, folder, resourceType)
    );

    return Promise.all(uploadPromises);
};
