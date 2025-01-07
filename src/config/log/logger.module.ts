import { Global, Module } from '@nestjs/common';
import { MyLogger } from './MyLogger.service';

@Global()
@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
