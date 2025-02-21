import { OmitUpdateType } from '@services/openApi';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Tutor } from '../entity/tutor.entity';

export class CreateTutorDTO extends OmitUpdateType(Tutor, [
  'userId',
  'qualifiedSubject',
  'tutorSSN',
  'information',
  'tutorCode',
]) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
