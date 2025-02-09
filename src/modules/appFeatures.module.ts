import { Module } from '@nestjs/common';
import { SampleModule } from './sample';
import { StudentModule } from './student';
import { AuthenticationModule } from './authentication';
import { CourseModule } from './course/course.module';

@Module({
  imports: [SampleModule, StudentModule, AuthenticationModule, CourseModule],
})
export class AppFeaturesModule {}
