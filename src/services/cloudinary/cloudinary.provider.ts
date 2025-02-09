import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from '@environment';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: async () => {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  },
};
