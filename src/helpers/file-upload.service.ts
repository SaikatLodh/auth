import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class FileUploadService {
    constructor(private configService: ConfigService) {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error(
                'Cloudinary configuration is missing. Please check your environment variables.',
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }
    async uploadToCloudinary(file: Express.Multer.File) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        // Only unlink if file.path exists (for disk storage)
                        if (file.path) {
                            try {
                                fs.unlinkSync(file.path);
                            } catch (unlinkError) {
                                console.error('Failed to unlink file:', unlinkError);
                            }
                        }
                        reject(new Error(`Upload failed: ${error.message}`));
                    } else {
                        resolve(result);
                    }
                },
            );
            uploadStream.end(file.buffer);
        });
    }

    async uploadBase64Image(base64String: string) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(base64String, (error, result) => {
                if (error) {
                    reject(new Error(`Upload failed: ${error.message}`));
                } else {
                    resolve(result);
                }
            });
        });
    }


    async deleteFromCloudinary(public_id: string) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(public_id, (error, result) => {
                if (error) {
                    reject(new Error('Delete failed'));
                } else {
                    resolve(result);
                }
            });
        });
    }
}