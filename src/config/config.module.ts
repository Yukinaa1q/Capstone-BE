import { Module } from '@nestjs/common';
import { LoggerModule } from './log';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [LoggerModule, CacheModule.register({ isGlobal: true })],
})
export class ConfigModule {}
