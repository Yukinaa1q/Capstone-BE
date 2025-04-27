import { IsNumber, IsObject } from 'class-validator';
import { Course } from '../entity/course.entity';

export class ViewAllCourseDTO {
  @IsObject()
  data: Course;

  @IsNumber()
  totalStudentNumber: number;

  @IsNumber()
  totalClassNumber: number;
}
