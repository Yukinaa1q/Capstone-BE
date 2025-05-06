import { PartialType } from '@nestjs/swagger';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';
import { CreateTutorDTO } from './createTutor.dto';

export class UpdateTutorDTO extends PartialType(CreateTutorDTO) {
  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateTutorProfileDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsDate()
  dob: Date;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  tutorSSN: string;
}
