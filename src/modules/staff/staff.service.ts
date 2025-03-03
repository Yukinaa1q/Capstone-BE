import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff, staffRole } from './entity';
import { Repository } from 'typeorm';
import { generateCustomID, hashPassword } from '@utils';
import { CreateStaffDTO } from './dto';
import { UpdateStaffDTO } from './dto/updateStaff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async getNextStaffID(): Promise<string> {
    const lastStaff = await this.staffRepository
      .createQueryBuilder('staff')
      .orderBy('staff.staffCode', 'DESC')
      .getOne();

    const lastNumber = lastStaff ? parseInt(lastStaff.staffCode.slice(2)) : 0;
    return generateCustomID('SF', lastNumber + 1);
  }

  async createStaff(data: CreateStaffDTO): Promise<Staff> {
    if (!Object.values(staffRole).includes(data.role as staffRole)) {
      throw new BadRequestException('Invalid staff role');
    }

    const hashPass = await hashPassword(data.password);
    const staffCode = await this.getNextStaffID();

    const { password, ...staffData } = data;

    const newStaff = this.staffRepository.create({
      password: hashPass,
      staffCode: staffCode,
      role: data.role,
      ...staffData,
    });

    await this.staffRepository.save(newStaff);
    return newStaff;
  }

  async editStaffInfo(userId: string, data: UpdateStaffDTO): Promise<Staff> {
    if (
      data.role &&
      !Object.values(staffRole).includes(data.role as staffRole)
    ) {
      throw new BadRequestException('Invalid staff role');
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await this.staffRepository.update(userId, data);

    return this.staffRepository.findOne({ where: { userId: userId } });
  }

  async getAllStaff(): Promise<Staff[]> {
    const listStaff = await this.staffRepository.find();
    return listStaff;
  }

  async findOneStaff(data: string): Promise<Staff> {
    const findStaff = await this.staffRepository.findOne({
      where: { email: data },
    });
    return findStaff;
  }
}
