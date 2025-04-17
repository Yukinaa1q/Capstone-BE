import { IsNumber, IsString } from 'class-validator';

export class ViewAllClassroomDTO {
  @IsString()
  classId: string;

  @IsString()
  classCode: string;

  @IsNumber()
  classRegisteredStudents: number;

  @IsString()
  room: string;

  @IsNumber()
  classStudents: number; // max students

  @IsString()
  openStatus: string;

  @IsString()
  tutorId: string;

  @IsString()
  tutor: string;
}
