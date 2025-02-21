import { OmitUpdateType } from '@services/openApi';
import { IsString } from 'class-validator';
import { Course } from '../entity/course.entity';

export class CreateCourseDTO extends OmitUpdateType(Course, ['courseId']) {
  @IsString()
  courseCode: string;
}
