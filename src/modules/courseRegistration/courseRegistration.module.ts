import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentPreReg } from './entity/studentPreReg.entity';
import { TutorPreReg } from './entity/tutorPreReg.entity';
import { Phase1RegisterController } from './courseRegistration.controller';
import { CourseRegistrationService } from './courseRegistration.service';
import { CourseModule } from '@modules/course/course.module';
import { Course } from '@modules/course/entity/course.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { Room } from './entity/room.entity';
import { AllocateClassService } from './allocateClass.service';
import { CourseRegistrationP2Service } from './courseRegistrationP2.service';
import { Phase2RegisterController } from './courseRegistrationP2.controller';
import { RoomOccupied } from './entity/roomOccupied.entity';
import { WherebyModule } from '@services/whereby/whereby.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentPreReg,
      TutorPreReg,
      Course,
      Student,
      Tutor,
      Classroom,
      Room,
      RoomOccupied,
    ]),
    CourseModule,
    WherebyModule,
  ],
  controllers: [Phase1RegisterController, Phase2RegisterController],
  providers: [
    CourseRegistrationService,
    AllocateClassService,
    CourseRegistrationP2Service,
  ],
  exports: [
    CourseRegistrationService,
    AllocateClassService,
    CourseRegistrationP2Service,
  ],
})
export class CourseRegistrationModule {}
