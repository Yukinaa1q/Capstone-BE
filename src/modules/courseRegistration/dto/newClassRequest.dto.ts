import { IsBoolean, IsString } from 'class-validator';

export class ClassRequestDTO {
  @IsString()
  tutor: string;

  @IsString()
  tutorId: string;

  @IsString()
  tutorCode: string;

  @IsString()
  courseTitle: string;

  @IsString()
  courseCode: string;

  @IsString()
  courseLevel: string;

  @IsString()
  courseId: string;

  @IsString()
  courseSubject: string;

  @IsString()
  studyWeek: string;

  @IsString()
  studyShift: string;

  @IsBoolean()
  isOnline: boolean;
}
