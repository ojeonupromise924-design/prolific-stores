import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

interface CloudinaryDestroyResult {
  result: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(
    file: Buffer,
    folder = 'prolific-store/products',
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            {
              width: 1600,
              height: 1600,
              crop: 'limit',
            },
            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message || 'Cloudinary upload failed'));
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload failed'));
            return;
          }

          resolve(result);
        },
      );

      Readable.from(file).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<CloudinaryDestroyResult> {
    const result = (await cloudinary.uploader.destroy(
      publicId,
    )) as CloudinaryDestroyResult;

    return result;
  }

  getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  getMediumUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  getLargeUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 1600,
      height: 1600,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }
}
