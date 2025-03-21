import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';
export class StudentDetailDTO {
  @ApiProperty()
  @IsString()
  userCode: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  avatarUrl: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isVerified: boolean;

  @ApiProperty()
  @IsDate()
  dob: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ssid: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;
}
