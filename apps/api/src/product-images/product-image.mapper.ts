import { ProductImage } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export class ProductImageMapper {
  static toResponse(image: ProductImage, cloudinary: CloudinaryService) {
    return {
      id: image.id,

      originalUrl: image.url,

      thumbnailUrl: cloudinary.getThumbnailUrl(image.publicId),

      mediumUrl: cloudinary.getMediumUrl(image.publicId),

      largeUrl: cloudinary.getLargeUrl(image.publicId),

      altText: image.altText,

      isPrimary: image.isPrimary,

      position: image.position,

      createdAt: image.createdAt,

      updatedAt: image.updatedAt,
    };
  }
}
