import { Module } from '@nestjs/common';
import { AppFeaturesModule } from './modules';
import { ConfigModule } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '@common/guard';
import { CloudinaryModule } from '@services/cloudinary';

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
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
