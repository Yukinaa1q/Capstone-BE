import { Module } from '@nestjs/common';
import { AppFeaturesModule } from './modules';
import { ConfigModule } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '@common/guard';
import { CloudinaryModule } from '@services/cloudinary';
import { Classroom } from '@modules/class/entity/class.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';

@Module({
  imports: [
    AppFeaturesModule,
    GuardModule,
    ConfigModule,
    CloudinaryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'postgres',
      password: '123456',
      database: 'TuCour',
      entities: ['dist/modules/*/entity/*.entity.js'],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
