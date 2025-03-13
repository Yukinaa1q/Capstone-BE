import { OmitUpdateType } from '@services/openApi';
import { ApiProperty } from '@nestjs/swagger';
//import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Tutor } from '../entity/tutor.entity';

export class TutorListViewDTO extends OmitUpdateType(Tutor, [
  'userId',
  'phone',
  'name',
  'email',
  'tutorCode',
  'isVerified',
]) {
  @ApiProperty()
  tutorName: string;

  @ApiProperty()
  tutorId: string;

  @ApiProperty()
  tutorCode: string;

  @ApiProperty()
  tutorEmail: string;

  @ApiProperty()
  tutorPhone: string;

  @ApiProperty()
  isVerified: boolean;
}
