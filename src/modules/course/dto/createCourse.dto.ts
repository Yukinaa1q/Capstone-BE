import { OmitUpdateType } from '@services/openApi';
import { Course } from '../entity';
import { IsString } from 'class-validator';

export class CreateCourseDTO extends OmitUpdateType(Course, ['courseId']) {
  @IsString()
  pId: string;
}
