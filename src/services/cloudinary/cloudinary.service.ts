import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinaryInstance) {}
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cloudinaryInstance.uploader
        .upload_stream(
          { folder: 'courses' },
          (error, result: UploadApiResponse) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadPDF(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        folder: 'courses',
        resource_type: 'raw', // Explicitly treat as raw file
        // format: 'pdf', // Optional: force PDF format
      };
      this.cloudinaryInstance.uploader
        .upload_stream(options, (error, result: UploadApiResponse) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  async deletePDF(pdfUrl: string): Promise<void> {
    const publicId = this.extractPublicId(pdfUrl);
    if (!publicId) {
      throw new Error('Invalid pdf URL');
    }

    return new Promise((resolve, reject) => {
      this.cloudinaryInstance.uploader.destroy(
        publicId,
        { resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve();
        },
      );
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = this.extractPublicId(imageUrl);
    if (!publicId) {
      throw new Error('Invalid image URL');
    }

    return new Promise((resolve, reject) => {
      this.cloudinaryInstance.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private extractPublicId(imageUrl: string): string | null {
    const regex = /\/([^/]+)\.[a-z]+$/;
    const match = imageUrl.match(regex);
    return match ? `courses/${match[1]}` : null;
  }
}
