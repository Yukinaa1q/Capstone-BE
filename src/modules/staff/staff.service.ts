import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff, staffRole } from './entity';
import { Repository } from 'typeorm';
import { generateCustomID, hashPassword } from '@utils';
import { CreateStaffDTO } from './dto';
import { UpdateStaffDTO } from './dto/updateStaff.dto';
import { StaffListViewDTO } from './dto/staffListView.dto';
import { QualifiedSubject, Tutor } from '@modules/tutor/entity/tutor.entity';
import { ResponseCode, ServiceException } from '@common/error';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
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

    const staff = await this.staffRepository.findOne({
      where: { email: data.email },
    });
    if (staff) {
      throw new ServiceException(
        ResponseCode.SAME_EMAIL_ERROR,
        'This email has been registered',
      );
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

  async getAllStaffForTable(): Promise<StaffListViewDTO[]> {
    const staffs = await this.staffRepository.find();
    const result = [];
    staffs.forEach((staff, index) => {
      result[index] = {} as StaffListViewDTO;
      result[index].staffName = staff.name;
      result[index].staffId = staff.userId;
      result[index].staffCode = staff.staffCode;
      result[index].staffEmail = staff.email;
      result[index].staffPhone = staff.phone;
      result[index].staffRole = staff.role;
    });
    return result;
  }

  async findOneStaff(data: string): Promise<Staff> {
    const findStaff = await this.staffRepository.findOne({
      where: { email: data },
    });
    return findStaff;
  }

  async deleteStaff(userId: string): Promise<string> {
    await this.staffRepository.delete({ userId });
    return 'Staff deleted successfully';
  }

  async addQualification(
    data: QualifiedSubject[],
    tutorId: string,
  ): Promise<QualifiedSubject[]> {
    const tutor = await this.tutorRepository.findOne({
      where: { userId: tutorId },
    });
    for (const item of data) {
      const exists = tutor.qualifiedSubject.find(
        (subject) => subject.subject === item.subject,
      );

      if (!exists) {
        tutor.qualifiedSubject.push(item);
      } else {
        exists.level = item.level;
      }
    }
    await this.tutorRepository.save(tutor);
    return tutor.qualifiedSubject;
  }

  async verifyTutor(
    tutorId: string,
  ): Promise<{ message: string; success: boolean }> {
    const tutor = await this.tutorRepository.findOne({
      where: { userId: tutorId },
    });
    if (tutor.isVerified) {
      return { message: 'This tutor has been verified', success: false };
    }
    tutor.isVerified = true;
    await this.tutorRepository.save(tutor);
    return { message: 'You successfully verified this tutor', success: true };
  }

  async getQualification(tutorId: string): Promise<QualifiedSubject[]> {
    const tutor = await this.tutorRepository.findOne({
      where: { userId: tutorId },
    });
    return tutor.qualifiedSubject;
  }

  async deleteQualification(
    data: QualifiedSubject[],
    tutorId: string,
  ): Promise<QualifiedSubject[]> {
    const tutor = await this.tutorRepository.findOne({
      where: { userId: tutorId },
    });
    tutor.qualifiedSubject = tutor.qualifiedSubject.filter(
      (subject) => !data.some((item) => item.subject === subject.subject),
    );
    await this.tutorRepository.save(tutor);
    return tutor.qualifiedSubject;
  }
}
