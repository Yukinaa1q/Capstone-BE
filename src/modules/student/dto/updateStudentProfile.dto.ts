import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsDate, IsOptional } from 'class-validator';
export class UpdateStudentProfileDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  dob: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber: string;
}
