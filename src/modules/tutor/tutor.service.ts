import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { generateCustomID, hashPassword } from '@utils';
import { Tutor } from './entity/tutor.entity';
import { CreateTutorDTO } from './dto/createTutor.dto';
import { UpdateTutorDTO, UpdateTutorProfileDTO } from './dto/updateTutor.dto';
import { TutorListViewDTO } from './dto/tutorListview.dto';
import { TutorDetailDTO } from './dto/tutorDetails.dto';
import { ResponseCode, ServiceException } from '@common/error';
import { Classroom } from '@modules/class/entity/class.entity';
import { addDays, addMonths } from 'date-fns';
import { paymentFormula } from 'src/utils/paymentFormula';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Classroom)
    private readonly classRepository: Repository<Classroom>,
  ) {}

  async getNextTutorID(): Promise<string> {
    const lastTutor = await this.tutorRepository
      .createQueryBuilder('tutor')
      .orderBy('tutor.tutorCode', 'DESC')
      .getOne();

    const lastNumber = lastTutor ? parseInt(lastTutor.tutorCode.slice(2)) : 0;
    return generateCustomID('TU', lastNumber + 1);
  }

  async createTutor(data: CreateTutorDTO): Promise<Tutor> {
    const hashPass = await hashPassword(data.password);
    const tutorCode = await this.getNextTutorID();
    const { password, ...tutorData } = data;
    const newTutor = this.tutorRepository.create({
      password: hashPass,
      tutorCode: tutorCode,
      ...tutorData,
    });
    await this.tutorRepository.save(newTutor);
    return newTutor;
  }

  async getAllTutor(): Promise<Tutor[]> {
    const allTutor = await this.tutorRepository.find();
    return allTutor;
  }

  async getAllTutorForTable(): Promise<TutorListViewDTO[]> {
    const tutors = await this.tutorRepository.find();
    const result = [];
    tutors.forEach((tutor, index) => {
      result[index] = {} as TutorListViewDTO;
      result[index].tutorName = tutor.name;
      result[index].tutorId = tutor.userId;
      result[index].tutorCode = tutor.tutorCode;
      result[index].tutorEmail = tutor.email;
      result[index].tutorPhone = tutor.phone;
      result[index].isVerified = tutor.isVerified;
    });
    return result;
  }

  async editTutorInfo(userId: string, data: UpdateTutorDTO): Promise<Tutor> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    if (data.email) {
      const existingTutor = await this.tutorRepository.findOne({
        where: { email: data.email },
      });
      if (existingTutor && existingTutor.userId !== userId) {
        throw new ServiceException(
          ResponseCode.SAME_EMAIL_ERROR,
          'This email has been registered',
        );
      }
    }

    await this.tutorRepository.update(userId, data);

    return this.tutorRepository.findOne({ where: { userId: userId } });
  }

  async findOneTutor(data: string): Promise<Tutor> {
    const findTutor = await this.tutorRepository.findOne({
      where: { email: data },
    });
    return findTutor;
  }
  async findOneTutorByPhone(data: string): Promise<Tutor> {
    const findTutor = await this.tutorRepository.findOne({
      where: { phone: data },
    });
    return findTutor;
  }

  async getTutorDetail(userId: string): Promise<TutorDetailDTO> {
    const tutor = await this.tutorRepository.findOne({
      where: { userId: userId },
    });
    const tutorDetail = new TutorDetailDTO();
    tutorDetail.userId = tutor.userId;
    tutorDetail.userCode = tutor.tutorCode;
    tutorDetail.avatarUrl = tutor.avatarUrl;
    tutorDetail.fullName = tutor.name;
    tutorDetail.email = tutor.email;
    tutorDetail.dob = tutor.DOB;
    tutorDetail.phoneNumber = tutor.phone;
    tutorDetail.isVerified = tutor.isVerified;
    tutorDetail.ssid = tutor.tutorSSN;
    return tutorDetail;
  }

  async viewRegisteredClasses(userId: string) {
    const findTutor = await this.tutorRepository.findOne({
      where: { userId: userId },
    });
    const listRegisteredClasses = await this.classRepository.find({
      where: {
        classId: In(findTutor.classList),
      },
    });
    const result = [];
    listRegisteredClasses.forEach((item) =>
      result.push({
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
      }),
    );
    return result;
  }

  async viewRegisteredClassesSimple(userId: string) {
    const findTutor = await this.tutorRepository.findOne({
      where: { userId: userId },
    });

    const listPaidClasses = await this.classRepository.find({
      where: { classId: In(findTutor.paidClassList) },
    });
    const result = [];
    listPaidClasses.forEach((item) =>
      result.push({
        classCode: item.classCode,
        courseName: item.courseTitle,
        courseCode: item.courseCode,
        tutor: item.tutor.name,
        class: item.classRoom,
        courseImg: item.course.courseImage,
        classUrl: item.room.onlineRoom || 'None',
        status: item.status,
      }),
    );

    return result;
  }

  async updateTutorProfile(
    tutorId: string,
    data: UpdateTutorProfileDTO,
  ): Promise<Tutor> {
    const student = await this.tutorRepository.findOne({
      where: { userId: tutorId },
    });
    if (!student) {
      throw new NotFoundException('Tutor not found');
    }
    if (data.email) {
      const existingStudent = await this.tutorRepository.findOne({
        where: { email: data.email },
      });
      if (existingStudent && existingStudent.userId !== tutorId) {
        throw new ServiceException(
          ResponseCode.SAME_EMAIL_ERROR,
          'This email has been registered',
        );
      }
      student.email = data.email;
    }
    if (data.name) {
      student.name = data.name;
    }
    if (data.dob) {
      student.DOB = data.dob;
    }

    if (data.tutorSSN) {
      const existingTutor = await this.tutorRepository.findOne({
        where: { tutorSSN: data.tutorSSN },
      });
      if (existingTutor && existingTutor.userId !== tutorId) {
        throw new ServiceException(
          ResponseCode.SAME_EMAIL_ERROR,
          'This tutorSSN has been registered',
        );
      }
      student.tutorSSN = data.tutorSSN;
    }

    if (data.phoneNumber) {
      const existingTutor = await this.tutorRepository.findOne({
        where: { phone: data.phoneNumber },
      });
      if (existingTutor && existingTutor.userId !== tutorId) {
        throw new ServiceException(
          ResponseCode.PHONE_EXIST,
          'This phone has been registered',
        );
      }
      student.phone = data.phoneNumber;
    }

    await this.tutorRepository.save(student);
    return this.tutorRepository.findOne({ where: { userId: tutorId } });
  }

  async viewTutorClassHistory(tutorId: string) {
    const findTutor = await this.tutorRepository.findOne({
      where: { userId: tutorId },
    });
    const result = [];
    if (findTutor.paidClassList && findTutor.paidClassList.length > 0) {
      const findHistoryClasses = await this.classRepository.findBy({
        classId: In(findTutor.paidClassList),
      });
      for (const item of findHistoryClasses) {
        let paymentTutor = paymentFormula(
          item.course.coursePrice,
          item.currentStudents,
          item.course.duration,
          0.4,
        );
        result.push({
          courseTitle: item.courseTitle,
          courseCode: item.courseCode,
          classCode: item.classCode,
          classSession: item.studyWeek,
          classShift: item.studyShift,
          studyRoom: item.room.roomCode,
          pricePaid: paymentTutor,
        });
      }
    }
    return result;
  }
}
