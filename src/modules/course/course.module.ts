import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CloudinaryModule } from '@services/cloudinary';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), CloudinaryModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
