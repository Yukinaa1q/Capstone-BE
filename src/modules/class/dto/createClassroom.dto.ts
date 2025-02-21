import { OmitUpdateType } from '@services/openApi';
import { IsString } from 'class-validator';
import { Classroom } from '../entity/class.entity';

export class CreateClassroomDTO extends OmitUpdateType(Classroom, ['classId']) {
  @IsString()
  classCode: string;

  @IsString()
  tutorCode: string;

  @IsString()
  courseCode: string;
}
