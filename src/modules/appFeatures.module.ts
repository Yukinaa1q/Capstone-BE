import { Module } from '@nestjs/common';
import { SampleModule } from './sample';
import { StudentModule } from './student';
import { AuthenticationModule } from './authentication';
import { CourseModule } from './course/course.module';
import { TutorModule } from './tutor/tutor.module';
import { ClassroomModule } from './class/class.module';
import { CourseRegistrationModule } from './courseRegistration/courseRegistration.module';
import { AdminModule } from './admin';
import { StaffModule } from './staff';
import { RoomModule } from './room/room.module';
import { GradeModule } from './grade/grade.module';
import { StatModule } from './stats/stat.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    SampleModule,
    StudentModule,
    AuthenticationModule,
    CourseModule,
    TutorModule,
    ClassroomModule,
    CourseRegistrationModule,
    AdminModule,
    StaffModule,
    RoomModule,
    GradeModule,
    StatModule,
    NotificationModule,
  ],
})
export class AppFeaturesModule {}
