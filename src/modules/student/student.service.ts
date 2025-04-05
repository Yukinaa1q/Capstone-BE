import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDTO } from './dto';
import { generateCustomID, hashPassword } from '@utils';
import { UpdateStudentDTO } from './dto/updateStudent.dto';
import { Student } from './entity/student.entity';
import { StudentListViewDTO } from './dto/studentListView.dto';
import { StudentDetailDTO } from './dto/studentDetails.dto';
import { Classroom } from '@modules/class/entity/class.entity';
import { ResponseCode, ServiceException } from '@common/error';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
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

  async registerForClass(studentId: string, classId: string): Promise<Student> {
    // Find the classroom by ID
    const classroom = await this.classroomRepository.findOne({
      where: { classId },
    });

    if (!classroom) {
      throw new ServiceException(
        ResponseCode.CLASS_NOT_FOUND,
        'Class not found',
      );
    }

    if (classroom.currentStudents >= classroom.maxStudents) {
      throw new ServiceException(
        ResponseCode.CLASS_FULL,
        'Class is already at full capacity',
      );
    }

    const student = await this.studentRepository.findOne({
      where: { userId: studentId },
      relations: ['classrooms'],
    });

    if (!student) {
      throw new ServiceException(
        ResponseCode.USER_NOT_FOUND,
        'Student not found',
      );
    }

    const isAlreadyRegistered = student.classrooms?.some(
      (cls) => cls.classId === classId,
    );

    if (isAlreadyRegistered) {
      throw new ServiceException(
        ResponseCode.REGISTERED_COURSE,
        'Student is already registered for this class',
      );
    }

    if (!classroom.students) {
      classroom.students = [];
    }
    classroom.students.push(student);

    classroom.studentList.push(studentId);

    classroom.currentStudents = (classroom.currentStudents || 0) + 1;

    await this.classroomRepository.save(classroom);

    if (!student.classes) {
      student.classes = [];
    }
    student.classrooms.push(classroom);
    student.classes.push(classroom.classCode);

    await this.studentRepository.save(student);

    return student;
  }
}
