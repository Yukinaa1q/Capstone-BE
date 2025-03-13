import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
} from '@services/openApi';
import { StaffService } from './staff.service';
import { Body, Get, Param, Post } from '@nestjs/common';
import { Staff } from './entity';
import { CreateStaffDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateStaffDTO } from './dto/updateStaff.dto';
import { QualifiedSubject, Tutor } from '@modules/tutor/entity/tutor.entity';

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

  @Post('/add-qualification/:tutorId')
  @ApiResponseObject(Tutor)
  async addQualification(
    @Body() data: QualifiedSubject[],
    @Param('tutorId') tutorId: string,
  ): Promise<Tutor> {
    return this.staffService.addQualification(data, tutorId);
  }

  @Get('verify-tutor/:tutorId')
  async verifyTutor(
    @Param('tutorId') tutorId: string,
  ): Promise<{ message: string; success: boolean }> {
    return this.staffService.verifyTutor(tutorId);
  }
}
