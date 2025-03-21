import { OmitUpdateType } from '@services/openApi';
import { ApiProperty } from '@nestjs/swagger';
import { Staff } from '../entity';

export class StaffListViewDTO extends OmitUpdateType(Staff, [
  'userId',
  'role',
  'staffCode',
  'name',
  'phone',
  'email',
]) {
  @ApiProperty()
  staffName: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  staffCode: string;

  @ApiProperty()
  staffEmail: string;

  @ApiProperty()
  staffPhone: string;

  @ApiProperty()
  staffRole: string;
}
