import { OmitUpdateType } from '@services/openApi';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Classroom } from '../entity/class.entity';

export class CreateClassroomDTO extends OmitUpdateType(Classroom, ['classId']) {
  @IsString()
  tutorCode: string;

  @IsString()
  courseCode: string;

  @IsString()
  tutorId: string;

  @IsString()
  courseId: string;

  @IsArray()
  @IsOptional()
  studentIdList?: string[];

  @IsString()
  courseTitle: string;

  @IsNumber()
  maxStudents: number;

  @IsString()
  studyWeek: string;

  @IsString()
  studyShift: string;

  @IsBoolean()
  isOnline: boolean;
}
