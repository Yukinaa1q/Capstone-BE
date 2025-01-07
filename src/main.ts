import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HOST, PORT } from '@environment';
import { MyLogger } from '@config';
import { initOpenApi } from '@services/openApi';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new MyLogger(AppModule.name);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(MyLogger));
  app.enableCors();
  app.use(helmet());

  initOpenApi(app);

  await app.listen(PORT, HOST).then(async () => {
    const url = await app.getUrl();
    logger.log(`App is running on ${url}`);
  });
}
bootstrap();
