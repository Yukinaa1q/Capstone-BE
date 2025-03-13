import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
} from '@services/openApi';
import { StaffService } from './staff.service';
import { Body, Get, Post } from '@nestjs/common';
import { Staff } from './entity';
import { CreateStaffDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateStaffDTO } from './dto/updateStaff.dto';

@ApiAuthController('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('/create')
  @ApiResponseObject(Staff)
  async createStaff(@Body() body: CreateStaffDTO): Promise<Staff> {
    return this.staffService.createStaff(body);
  }

  @Get('all-staff')
  @ApiResponseArray(Staff)
  async getAllStaff(): Promise<Staff[]> {
    return this.staffService.getAllStaff();
  }

  @Post('/update')
  @ApiResponseObject(Staff)
  async updateStaffInfo(
    @CurrentUser() staff: any,
    @Body() data: UpdateStaffDTO,
  ): Promise<Staff> {
    return this.staffService.editStaffInfo(staff.userId, data);
  }
}
