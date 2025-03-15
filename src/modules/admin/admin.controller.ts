import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
} from '@services/openApi';
import { AdminService } from './admin.service';
import { Body, Get, Post } from '@nestjs/common';
import { Staff } from '@modules/staff/entity/staff.entity';
import { CreateAdminDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateAdminDTO } from './dto/updateAdmin.dto';
import { CreateStaffDTO } from '@modules/staff/dto';

@ApiAuthController('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Post('/create')
  // @ApiResponseObject(Staff)
  // async createAdmin(@Body() body: CreateAdminDTO): Promise<Staff> {
  //   return this.adminService.createAdmin(body);
  // }
  // @Post('/update')
  // @ApiResponseObject(Staff)
  // async updateAdminInfo(
  //   @CurrentUser() admin: any,
  //   @Body() data: UpdateAdminDTO,
  // ): Promise<Staff> {
  //   return this.adminService.editAdminInfo(admin.userId, data);
  // }
  // @Get('all-admin')
  // @ApiResponseArray(Staff)
  // async getAllAdmin(): Promise<Staff[]> {
  //   return this.adminService.getAllAdmin();
  // }

  @Post('create-staff')
  @ApiResponseObject(Staff)
  async createStaff(
    @Body() data: CreateStaffDTO,
    @CurrentUser() admin: any,
  ): Promise<Staff> {
    return this.adminService.createStaffAccount(data, admin.role);
  }
}
