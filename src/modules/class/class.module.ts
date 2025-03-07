import { CourseModule } from '@modules/course/course.module';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { TutorModule } from '@modules/tutor/tutor.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomController } from './class.controller';
import { ClassroomService } from './class.service';
import { Classroom } from './entity/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom, Tutor, Student]),
    TutorModule,
    CourseModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
