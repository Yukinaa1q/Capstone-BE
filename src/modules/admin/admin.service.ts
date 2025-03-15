import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from '@modules/staff/entity/staff.entity';
import { Repository } from 'typeorm';
import { generateCustomID, hashPassword } from '@utils';
import { CreateAdminDTO } from './dto';
import { UpdateAdminDTO } from './dto/updateAdmin.dto';
import { CreateStaffDTO } from '@modules/staff/dto';
import { ResponseCode, ServiceException } from '@common/error';
import { StaffService } from '@modules/staff';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Staff)
    private readonly adminRepository: Repository<Staff>,
    private readonly staffService: StaffService,
  ) {}
  // async getNextAdminID(): Promise<string> {
  //   const lastAdmin = await this.adminRepository
  //     .createQueryBuilder('admin')
  //     .orderBy('admin.adminCode', 'DESC')
  //     .getOne();

  //   const lastNumber = lastAdmin ? parseInt(lastAdmin.adminCode.slice(2)) : 0;
  //   return generateCustomID('AD', lastNumber + 1);
  // }
  // async createAdmin(data: CreateAdminDTO): Promise<Admin> {
  //   const hashPass = await hashPassword(data.password);
  //   const adminCode = await this.getNextAdminID();
  //   const { password, ...adminData } = data;
  //   const newAdmin = this.adminRepository.create({
  //     password: hashPass,
  //     adminCode: adminCode,
  //     ...adminData,
  //   });
  //   await this.adminRepository.save(newAdmin);
  //   return newAdmin;
  // }
  // async editAdminInfo(userId: string, data: UpdateAdminDTO): Promise<Admin> {
  //   if (data.password) {
  //     data.password = await hashPassword(data.password);
  //   }

  //   await this.adminRepository.update(userId, data);

  //   return this.adminRepository.findOne({ where: { userId: userId } });
  // }
  // async getAllAdmin(): Promise<Admin[]> {
  //   const listAdmin = await this.adminRepository.find();
  //   return listAdmin;
  // }

  async createStaffAccount(data: CreateStaffDTO, role: string): Promise<Staff> {
    if (role != 'admin')
      throw new ServiceException(ResponseCode.UNAUTHORIZED, 'Unauthorized');

    const staff = await this.staffService.createStaff(data);
    return staff;
  }
}
