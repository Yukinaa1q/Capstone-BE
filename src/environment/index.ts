import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const HOST = process.env.HOST || 'localhost';
export const DOCS_ENDPOINT = process.env.DOCS_ENDPOINT || '/docs';
export const DOCS_JSON_ENDPOINT =
  process.env.DOCS_JSON_ENDPOINT || '/docs/openApi.json';
export const DATABASE_USERNAME = process.env.DATABASE_USERNAME || '';
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
