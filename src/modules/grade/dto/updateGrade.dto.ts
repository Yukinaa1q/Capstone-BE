import { IsDecimal, IsOptional } from 'class-validator';

export class UpdateGradeDTO {
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
