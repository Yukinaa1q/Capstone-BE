import { GuardModule } from '@common/guard';
import { ConfigModule } from '@config';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '@services/cloudinary';
import { AppFeaturesModule } from './modules';
import { WherebyModule } from '@services/whereby/whereby.module';

@Module({
  imports: [
    AppFeaturesModule,
    GuardModule,
    ConfigModule,
    CloudinaryModule,
    WherebyModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'postgres',
      password: '20072003',
      database: 'tucour',
      // entities: ['dist/modules/*/entity/*.entity.js'],
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
