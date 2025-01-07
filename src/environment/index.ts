import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const HOST = process.env.HOST || 'localhost';
export const DOCS_ENDPOINT = process.env.DOCS_ENDPOINT || '/docs';
export const DOCS_JSON_ENDPOINT =
  process.env.DOCS_JSON_ENDPOINT || '/docs/openApi.json';
