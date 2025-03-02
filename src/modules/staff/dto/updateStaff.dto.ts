import { PartialType } from '@nestjs/swagger';
import { CreateStaffDTO } from './createStaff.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStaffDTO extends PartialType(CreateStaffDTO) {
  @IsOptional()
  @IsString()
  password?: string;
}
