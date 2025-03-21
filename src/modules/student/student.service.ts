import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDTO } from './dto';
import { generateCustomID, hashPassword } from '@utils';
import { UpdateStudentDTO } from './dto/updateStudent.dto';
import { Student } from './entity/student.entity';
import { StudentListViewDTO } from './dto/studentListView.dto';
import { StudentDetailDTO } from './dto/studentDetails.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async getNextStudentID(): Promise<string> {
    const lastStudent = await this.studentRepository
      .createQueryBuilder('student')
      .orderBy('student.studentCode', 'DESC')
      .getOne();

    const lastNumber = lastStudent
      ? parseInt(lastStudent.studentCode.slice(2))
      : 0;
    return generateCustomID('ST', lastNumber + 1);
  }

  async createStudent(data: CreateStudentDTO): Promise<Student> {
    const hashPass = await hashPassword(data.password);
    const studentCode = await this.getNextStudentID();
    const { password, ...studentData } = data;
    const newStudent = this.studentRepository.create({
      password: hashPass,
      studentCode: studentCode,
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

  async getAllStudent(): Promise<Student[]> {
    const listStudent = await this.studentRepository.find();
    return listStudent;
  }

  async getAllStudentForTable(): Promise<StudentListViewDTO[]> {
    const students = await this.studentRepository.find();
    const result = [];
    students.forEach((student, index) => {
      result[index] = {} as StudentListViewDTO;
      result[index].studentName = student.name;
      result[index].studentId = student.userId;
      result[index].studentCode = student.studentCode;
      result[index].studentEmail = student.email;
    });
    return result;
  }

  async findOneStudent(data: string): Promise<Student> {
    const findStudent = await this.studentRepository.findOne({
      where: { email: data },
    });
    return findStudent;
  }

  async getStudentDetail(userId: string): Promise<StudentDetailDTO> {
    const student = await this.studentRepository.findOne({
      where: { userId },
    });

    const studentDetail = new StudentDetailDTO();
    studentDetail.userId = student.userId;
    studentDetail.userCode = student.studentCode;
    studentDetail.avatarUrl = student.avatarUrl;
    studentDetail.fullName = student.name;
    studentDetail.email = student.email;
    studentDetail.dob = student.DOB;
    studentDetail.phoneNumber = student.phone;

    return studentDetail;
  }
}
