import { OmitUpdateType } from '@services/openApi';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Staff } from '@modules/staff';

export class CreateAdminDTO extends OmitUpdateType(Staff, [
  'userId',
  'adminCode',
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
