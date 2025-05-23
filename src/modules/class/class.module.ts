import { CourseModule } from '@modules/course/course.module';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { TutorModule } from '@modules/tutor/tutor.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomController } from './class.controller';
import { ClassroomService } from './class.service';
import { Classroom } from './entity/class.entity';
import { Room } from '@modules/courseRegistration/entity/room.entity';
import { RoomOccupied } from '@modules/courseRegistration/entity/roomOccupied.entity';
import { WherebyModule } from '@services/whereby/whereby.module';
import { Course } from '@modules/course/entity/course.entity';
import { Grade } from '@modules/grade/entity/grade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classroom,
      Tutor,
      Student,
      Room,
      RoomOccupied,
      Course,
      Grade
    ]),
    TutorModule,
    CourseModule,
    WherebyModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
