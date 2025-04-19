import { IsNumber, IsString } from 'class-validator';

export class ReturnClassPaginationDTO {
  @IsString()
  courseTitle: string;

  @IsString()
  courseCode: string;

  @IsString()
  courseId: string;

  @IsNumber()
  coursePrice: number;

  @IsString()
  courseImage: string;

  @IsString()
  classId: string;

  @IsString()
  classCode: string;

  @IsString()
  registrationStartDate: string;

  @IsString()
  registrationEndDate: string;

  @IsString()
  tutor: string;

  @IsNumber()
  currentStudents: number;

  @IsNumber()
  maxStudents: number;
}
