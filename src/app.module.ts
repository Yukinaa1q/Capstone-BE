import { Module } from '@nestjs/common';
import { AppFeaturesModule } from './modules';
import { ConfigModule } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '@common/guard';
import { CloudinaryModule } from '@services/cloudinary';
import { Classroom } from '@modules/class/entity/class.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { ScheduleModule } from '@nestjs/schedule';

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
      password: '20072003',
      database: 'tucour',
      // entities: ['dist/modules/*/entity/*.entity.js'],
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
