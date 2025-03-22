import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStaffDTO } from './createStaff.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { staffRole, Role } from '../entity';

export class UpdateStaffDTO extends PartialType(CreateStaffDTO) {
  @IsOptional()
  @IsString()
  staffName?: string;

  @IsOptional()
  @IsString()
  staffPassword?: string;

  @ApiProperty({ enum: staffRole, required: false })
  @IsEnum(staffRole)
  @IsOptional()
  staffRole?: Role;

  @IsOptional()
  @IsString()
  staffEmail?: string;

  @IsOptional()
  @IsString()
  staffPhone?: string;
}
