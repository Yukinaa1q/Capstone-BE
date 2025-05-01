import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateGradeDTO {
  @IsString()
  classroomId: string;

  @IsString()
  studentId: string;

  @IsDecimal()
  @IsOptional()
  assignmentScore?: number;

  @IsDecimal()
  @IsOptional()
  midtermScore?: number;

  @IsDecimal()
  @IsOptional()
  finalScore?: number;

  @IsDecimal()
  @IsOptional()
  homeworkScore?: number;
}
