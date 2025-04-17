import { GuardModule } from '@common/guard';
import { ConfigModule } from '@config';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '@services/cloudinary';
import { AppFeaturesModule } from './modules';

@Module({
  imports: [
    AppFeaturesModule,
    GuardModule,
    ConfigModule,
    CloudinaryModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'postgres',
      password: '30092003',
      database: 'Tucour',
      // entities: ['dist/modules/*/entity/*.entity.js'],
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
