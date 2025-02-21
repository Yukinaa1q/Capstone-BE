import { IsNumber, IsString } from 'class-validator';

export class ViewAllClassroomDTO {
  @IsString()
  classId: string;

  @IsString()
  classCode: string;

  @IsNumber()
  classStudents: number;

  @IsString()
  tutorId: string;

  @IsString()
  tutor: string;
}
