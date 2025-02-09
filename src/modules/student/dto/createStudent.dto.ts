import { OmitUpdateType } from '@services/openApi';
import { Student } from '../entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDTO extends OmitUpdateType(Student, [
  'userId',
  'firstCreated',
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
