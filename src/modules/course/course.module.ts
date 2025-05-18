import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CloudinaryModule } from '@services/cloudinary';
import { Classroom } from '@modules/class/entity/class.entity';
import { Course } from './entity/course.entity';
import { ClassRequest } from '@modules/courseRegistration/entity/requestClassCreation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Classroom, ClassRequest]),
    CloudinaryModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
