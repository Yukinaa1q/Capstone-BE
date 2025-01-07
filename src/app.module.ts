import { Module } from '@nestjs/common';
import { AppFeaturesModule } from './modules';
import { ConfigModule } from '@config';

@Module({
  imports: [AppFeaturesModule, ConfigModule],
})
export class AppModule {}
