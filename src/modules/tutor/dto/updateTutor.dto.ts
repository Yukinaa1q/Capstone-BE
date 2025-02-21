import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateTutorDTO } from './createTutor.dto';

export class UpdateTutorDTO extends PartialType(CreateTutorDTO) {
  @IsOptional()
  @IsString()
  password?: string;
}
