import { OmitUpdateType } from '@services/openApi';
import { Staff, staffRole } from '../entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStaffDTO extends OmitUpdateType(Staff, [
  'userId',
  'role',
  'staffCode',
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
  @IsEnum(staffRole)
  @IsNotEmpty()
  role: staffRole;
}
