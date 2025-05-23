import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationMeta } from '../courseRegistration.service';
import { Classroom } from '@modules/class/entity/class.entity';

export class CourseRegDTO {
  @IsString()
  courseId: string;

  @IsString()
  courseTitle: string;

  @IsString()
  courseCode: string;

  @IsNumber()
  coursePrice: number;

  @IsString()
  courseImage: string;

  @IsBoolean()
  isRegistered: boolean;
}

export class CourseUnRegP1DTO extends CourseRegDTO {
  @IsString()
  registrationDate: string;

  @IsNumber()
  totalRegistration: number;

  @IsString()
  courseSubject: string;

  @IsString()
  courseLevel: string;
}

export class CourseRegP1DTO extends CourseRegDTO {
  @IsBoolean()
  isOnline: boolean;

  @IsNumber()
  totalRegistration: number;
}

export class CourseRegP2DTO extends CourseRegDTO {
  @IsString()
  tutor: string;

  @IsNumber()
  currentStudents: number;

  @IsNumber()
  maxStudents: number;

  @IsString()
  studyWeek: string;

  @IsString()
  studyShift: string;

  @IsBoolean()
  isOnline: boolean;
}

export class InputStudentP1RegDTO {
  @IsString()
  courseId: string;

  @IsString()
  userId: string;

  @IsBoolean()
  isOnline: boolean;
}

export class InputTutorP1RegDTO {
  @IsString()
  courseId: string;

  @IsString()
  tutorId: string;

  @IsArray()
  @IsOptional()
  evenTimeShift?: string[];

  @IsArray()
  @IsOptional()
  oddTimeShift?: string[];
}

export class UnregisterStudentP1 {
  @IsString()
  courseId: string;

  @IsString()
  studentId: string;
}

export class UnregisterTutorP1 {
  @IsString()
  courseId: string;

  @IsString()
  tutorId: string;
}

export class ResponseViewApi {
  @IsArray()
  data: CourseUnRegP1DTO[];

  @IsObject()
  meta: PaginationMeta;
}

export class ResponseViewApiP2 {
  @IsArray()
  data: Classroom[];

  @IsObject()
  meta: PaginationMeta;
}

export class TutorRegSchedule {
  @IsString()
  studyWeek: string;

  @IsString()
  studyShift: string;

  @IsBoolean()
  online: boolean;
}

export class NewTutorRegDTO {
  @IsString()
  courseId: string;

  @IsArray()
  registrationList: TutorRegSchedule[];
}
