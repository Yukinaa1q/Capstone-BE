import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { StaffService } from './staff.service';
import { Body, Delete, Get, Param, Post } from '@nestjs/common';
import { Staff } from './entity';
import { CreateStaffDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateStaffDTO } from './dto/updateStaff.dto';
import { QualifiedSubject, Tutor } from '@modules/tutor/entity/tutor.entity';
import { StaffListViewDTO } from './dto/staffListView.dto';

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

  @Get('all-staff-table')
  @ApiResponseArray(StaffListViewDTO)
  async getAllStaffForTable(): Promise<StaffListViewDTO[]> {
    return this.staffService.getAllStaffForTable();
  }

  @Post('/update')
  @ApiResponseObject(Staff)
  async updateStaffInfo(
    @CurrentUser() staff: any,
    @Body() data: UpdateStaffDTO,
  ): Promise<Staff> {
    return this.staffService.editStaffInfo(staff.userId, data);
  }

  @Delete('delete-staff/:id')
  @ApiResponseString()
  async deleteStaff(@Param('id') id: string): Promise<string> {
    return this.staffService.deleteStaff(id);
  }

  @Post('/add-qualification/:tutorId')
  @ApiResponseObject(QualifiedSubject)
  async addQualification(
    @Body() data: QualifiedSubject[],
    @Param('tutorId') tutorId: string,
  ): Promise<QualifiedSubject[]> {
    return this.staffService.addQualification(data, tutorId);
  }

  @Get('get-qualification/:tutorId')
  @ApiResponseArray(QualifiedSubject)
  async getQualification(
    @Param('tutorId') tutorId: string,
  ): Promise<QualifiedSubject[]> {
    return this.staffService.getQualification(tutorId);
  }

  @Get('verify-tutor/:tutorId')
  async verifyTutor(
    @Param('tutorId') tutorId: string,
  ): Promise<{ message: string; success: boolean }> {
    return this.staffService.verifyTutor(tutorId);
  }

  @Delete('delete-qualification/:tutorId')
  @ApiResponseArray(QualifiedSubject)
  async deleteQualification(
    @Body() data: QualifiedSubject[],
    @Param('tutorId') tutorId: string,
  ): Promise<QualifiedSubject[]> {
    return this.staffService.deleteQualification(data, tutorId);
  }
}
