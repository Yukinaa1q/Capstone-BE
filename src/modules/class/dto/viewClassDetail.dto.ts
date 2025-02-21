import { CourseContentItem } from '@modules/course/entity/course.entity';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

class studentDetail {
  @IsString()
  studentName: string;

  @IsString()
  studentId: string;

  @IsString()
  @IsOptional()
  avatarLink?: string;
}

export class ViewClassDetailDTO {
  @IsString()
  courseTitle: string;

  @IsString()
  courseCode: string;

  @IsString()
  learningDuration: string;

  @IsString()
  registrationDuration: string;

  @IsString()
  tutor: string;

  @IsString()
  courseDescription: string;

  @IsArray()
  courseOutline: CourseContentItem[];

  @IsNumber()
  coursePrice: number;

  @IsString()
  classSession: string;

  @IsString()
  classShift: string;

  @IsBoolean()
  learningType: boolean;

  @IsString()
  classCode: string;

  @IsNumber()
  classStudents: number;

  @IsNumber()
  classMaxStudents: number;

  @IsArray()
  @IsOptional()
  studentList?: studentDetail[];
}
