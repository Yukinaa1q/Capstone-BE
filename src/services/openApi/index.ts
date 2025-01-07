import { DOCS_ENDPOINT, DOCS_JSON_ENDPOINT } from '@environment';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export * from './openApi.type';

export const initOpenApi = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('API document')
    .setDescription(`[JSON API DOCUMENT](${DOCS_JSON_ENDPOINT})`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_, key) => key,
  });
  SwaggerModule.setup(DOCS_ENDPOINT, app, document, {
    jsonDocumentUrl: DOCS_JSON_ENDPOINT,
  });
};
