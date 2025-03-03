import { PartialType } from '@nestjs/swagger';
import { CreateAdminDTO } from './createAdmin.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminDTO extends PartialType(CreateAdminDTO) {
  @IsOptional()
  @IsString()
  password?: string;
}
