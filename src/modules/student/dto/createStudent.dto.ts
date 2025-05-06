import { OmitUpdateType } from '@services/openApi';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Student } from '../entity/student.entity';

export class CreateStudentDTO extends OmitUpdateType(Student, [
  'userId',
  'firstCreated',
  'studentCode',
]) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;
}
