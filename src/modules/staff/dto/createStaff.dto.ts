import { OmitUpdateType } from '@services/openApi';
import { Staff, staffRole, Role } from '../entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

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

  @ApiProperty({
    enum: staffRole,
    description: 'Staff role type',
    example: staffRole.ACADEMIC,
  })
  @IsEnum(staffRole)
  @IsNotEmpty()
  role: Role;
}
