import { PartialType } from '@nestjs/swagger';
import { CreateStudentDTO } from './createStudent.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStudentDTO extends PartialType(CreateStudentDTO) {
  @IsOptional()
  @IsString()
  password?: string;
}
