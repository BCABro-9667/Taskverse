
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

export async function uploadImage(fileBuffer: Buffer, folder: string = 'taskmaster_uploads'): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload failed without error or result.'));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function uploadImageFromReadableStream(fileStream: NodeJS.ReadableStream, folder: string = 'taskmaster_uploads'): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload failed without error or result.'));
        }
      }
    );
    fileStream.pipe(uploadStream);
  });
}


export async function handleImageUpload(file: File, folder: string = 'taskmaster_uploads'): Promise<string | null> {
  if (!file) return null;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    console.error('Unsupported file type for image upload.');
    return null; // Or throw error
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await uploadImage(buffer, folder);
    if ('secure_url' in result) {
      return result.secure_url;
    } else {
      console.error('Cloudinary upload error:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Failed to upload image to Cloudinary:', error);
    return null;
  }
}
