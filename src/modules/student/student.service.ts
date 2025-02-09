import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entity';
import { Repository } from 'typeorm';
import { CreateStudentDTO } from './dto';
import { hashPassword } from '@utils';
import { UpdateStudentDTO } from './dto/updateStudent.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async createStudent(data: CreateStudentDTO): Promise<Student> {
    const hashPass = await hashPassword(data.password);
    const { password, ...studentData } = data;
    const newStudent = this.studentRepository.create({
      password: hashPass,
      ...studentData,
    });
    await this.studentRepository.save(newStudent);
    return newStudent;
  }

  async editStudentInfo(
    userId: string,
    data: UpdateStudentDTO,
  ): Promise<Student> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await this.studentRepository.update(userId, data);

    return this.studentRepository.findOne({ where: { userId: userId } });
  }

  async findOneStudent(data: string): Promise<Student> {
    const findStudent = await this.studentRepository.findOne({
      where: { email: data },
    });
    return findStudent;
  }
}
