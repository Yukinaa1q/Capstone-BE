import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateStudentDTO } from './dto';
import { generateCustomID, hashPassword } from '@utils';
import { UpdateStudentDTO } from './dto/updateStudent.dto';
import { Student } from './entity/student.entity';
import { StudentListViewDTO } from './dto/studentListView.dto';
import { StudentDetailDTO } from './dto/studentDetails.dto';
import { Classroom } from '@modules/class/entity/class.entity';
import { ResponseCode, ServiceException } from '@common/error';
import { addDays, addMonths } from 'date-fns';
import { UpdateStudentProfileDTO } from './dto/updateStudentProfile.dto';
import { Stat } from '@modules/stats/entity/stat.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Stat)
    private readonly statRepository: Repository<Stat>,
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

    if (data.email) {
      const existingTutor = await this.studentRepository.findOne({
        where: { email: data.email },
      });
      if (existingTutor && existingTutor.userId !== userId) {
        throw new ServiceException(
          ResponseCode.SAME_EMAIL_ERROR,
          'This email has been registered',
        );
      }
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

  async findOneStudentByPhone(data: string): Promise<Student> {
    const findStudent = await this.studentRepository.findOne({
      where: { phone: data },
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

  async registerForClass(studentId: string, classId: string): Promise<string> {
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

    classroom.studentList.push(studentId);

    classroom.currentStudents = (classroom.currentStudents || 0) + 1;

    await this.classroomRepository.save(classroom);

    student.classes.push(classroom.classId);

    await this.studentRepository.save(student);

    return 'Successfully registered ';
  }

  async viewRegisteredClasses(
    userId: string,
    page: number = 1, // Default to page 1
    limit: number = 10, // Default to 10 items per page
    search: string = '',
  ) {
    const findStudent = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    const classes = findStudent.classes;
    const query = this.classroomRepository.createQueryBuilder('classroom');
    if (classes.length > 0) {
      query.where('classroom.classId IN (:...classes)', {
        classes,
      });
    } else {
      query.where('1 = 1'); // Always true condition
    }
    if (search) {
      query.andWhere('LOWER(classroom.courseTitle) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    const [findAllClassroom, totalItems] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = findAllClassroom.map((item) => {
      return {
        classId: item.classId,
        classCode: item.classCode,
        registrationStartDate: new Date(item.startDate).toLocaleDateString(),
        registrationEndDate: addDays(
          new Date(item.startDate),
          15,
        ).toLocaleDateString(),
        studyStartDate: addDays(
          new Date(item.startDate),
          15,
        ).toLocaleDateString(),
        studyEndDate: addMonths(
          addDays(new Date(item.startDate), 15),
          item.course.duration,
        ).toLocaleDateString(),
        currentStudents: item.currentStudents,
        maxStudents: item.maxStudents,
        courseTitle: item.courseTitle,
        courseCode: item.courseCode,
        courseId: item.courseId,
        coursePrice: item.course.coursePrice,
        courseImage: item.course.courseImage,
        tutor: item.tutor.name,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: result,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async viewRegisteredClassesSimple(userId: string) {
    const findStudent = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    const listPaidClasses = await this.classroomRepository.find({
      where: {
        classId: In(findStudent.paidClass),
      },
    });
    const listRegisteredClasses = await this.classroomRepository.find({
      where: {
        classId: In(findStudent.classes),
        status: Not(In(['pending'])),
      },
    });
    const result = [];
    if (listPaidClasses && listPaidClasses.length > 0) {
      listPaidClasses.forEach((item) =>
        result.push({
          classCode: item.classCode,
          courseName: item.courseTitle,
          courseCode: item.courseCode,
          tutor: item.tutor.name,
          class: item.classRoom,
          courseImg: item.course.courseImage,
          classId: item.classId,
          classUrl: item.room.onlineRoom || 'None',
          status: item.status,
        }),
      );
    }
    if (listRegisteredClasses && listRegisteredClasses.length > 0) {
      listRegisteredClasses.forEach((item) =>
        result.push({
          classCode: item.classCode,
          courseName: item.courseTitle,
          courseCode: item.courseCode,
          tutor: item.tutor.name,
          class: item.classRoom,
          courseImg: item.course.courseImage,
          classId: item.classId,
          classUrl: item.room.onlineRoom || 'None',
          status: item.status,
        }),
      );
    }

    return result;
  }

  // async unregisterStudentFromClass(
  //   studentId: string,
  //   classId: string,
  // ): Promise<string> {
  //   const student = await this.studentRepository.findOne({
  //     where: { userId: studentId },
  //     relations: ['classrooms'],
  //   });
  //   if (!student) {
  //     throw new ServiceException(
  //       ResponseCode.USER_NOT_FOUND,
  //       'Student not found',
  //     );
  //   }
  //   if (!student.classes.includes(classId)) {
  //     throw new ServiceException(
  //       ResponseCode.CLASS_NOT_FOUND,
  //       'Student not in class',
  //     );
  //   }
  //   student.classes = student.classes.filter((c) => c !== classId);
  //   student.classrooms = student.classrooms.filter(
  //     (c) => c.classId !== classId,
  //   );
  //   await this.studentRepository.save(student);
  //   return 'Successfully unregistered from class';
  // }

  async updateStudentProfile(
    studentId: string,
    data: UpdateStudentProfileDTO,
  ): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { userId: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (data.email) {
      const existingStudent = await this.studentRepository.findOne({
        where: { email: data.email },
      });
      if (existingStudent && existingStudent.userId !== studentId) {
        throw new ServiceException(
          ResponseCode.SAME_EMAIL_ERROR,
          'This email has been registered',
        );
      }
      student.email = data.email;
    }
    if (data.phoneNumber) {
      const existingStudent = await this.studentRepository.findOne({
        where: { phone: data.phoneNumber },
      });
      if (existingStudent && existingStudent.userId !== studentId) {
        throw new ServiceException(
          ResponseCode.PHONE_EXIST,
          'This phone has been registered',
        );
      }
      student.phone = data.phoneNumber;
    }
    if (data.name) {
      student.name = data.name;
    }
    if (data.dob) {
      student.DOB = data.dob;
    }
    await this.studentRepository.save(student);
    return this.studentRepository.findOne({ where: { userId: studentId } });
  }

  async filterClassPayment(userId: string) {
    const findStudent = await this.studentRepository.findOne({
      where: { userId },
    });
    const findClasses = await this.classroomRepository.findBy({
      classId: In(findStudent.classes),
      status: 'payment',
    });
    const result = [];
    for (const item of findClasses) {
      result.push({
        classId: item.classId,
        classCode: item.classCode,
        registrationStartDate: new Date(item.startDate).toLocaleDateString(),
        registrationEndDate: addDays(
          new Date(item.startDate),
          10,
        ).toLocaleDateString(),
        studyStartDate: addDays(
          new Date(item.startDate),
          11,
        ).toLocaleDateString(),
        studyEndDate: addMonths(
          addDays(new Date(item.startDate), 11),
          item.course.duration,
        ).toLocaleDateString(),
        currentStudents: item.currentStudents,
        maxStudents: item.maxStudents,
        courseTitle: item.courseTitle,
        courseCode: item.courseCode,
        courseId: item.courseId,
        coursePrice: item.course.coursePrice,
        courseImage: item.course.courseImage,
        tutor: item.tutor.name,
      });
    }
    return result;
  }

  async classPayment(userId: string, classes: string[]): Promise<string> {
    const findStudent = await this.studentRepository.findOne({
      where: { userId },
    });

    for (const item of classes) {
      findStudent.paidClass.push(item);
    }

    for (const item of classes) {
      const findClass = await this.classroomRepository.findOne({
        where: { classId: item },
      });
      const newStat = this.statRepository.create({
        userId: userId,
        classId: item,
        type: 'income',
        value: findClass.course.coursePrice,
      });
      await this.statRepository.save(newStat);
    }
    findStudent.classes = findStudent.classes.filter(
      (item) => !findStudent.paidClass.includes(item),
    );
    await this.studentRepository.save(findStudent);
    return 'You have successfully paid the fee';
  }

  async viewStudentClassHistory(studentId: string) {
    const findStudent = await this.studentRepository.findOne({
      where: { userId: studentId },
    });
    const result = [];
    if (findStudent.paidClass && findStudent.paidClass.length > 0) {
      const findHistoryClasses = await this.classroomRepository.findBy({
        classId: In(findStudent.paidClass),
      });
      for (const item of findHistoryClasses) {
        result.push({
          courseTitle: item.courseTitle,
          courseCode: item.courseCode,
          classCode: item.classCode,
          classSession: item.studyWeek,
          classShift: item.studyShift,
          studyRoom: item.room.roomCode,
        });
      }
    }
    return result;
  }
}
