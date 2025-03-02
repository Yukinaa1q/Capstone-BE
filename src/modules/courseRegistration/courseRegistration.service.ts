import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentPreReg } from './entity/studentPreReg.entity';
import { Repository } from 'typeorm';
import {
  CourseRegP1DTO,
  CourseUnRegP1DTO,
  InputStudentP1RegDTO,
  InputTutorP1RegDTO,
  UnregisterStudentP1,
  UnregisterTutorP1,
} from './dto';
import { ResponseCode, ServiceException } from '@common/error';
import { TutorPreReg } from './entity/tutorPreReg.entity';
import { CourseService } from '@modules/course/course.service';

@Injectable()
export class CourseRegistrationService {
  constructor(
    @InjectRepository(StudentPreReg)
    private readonly studentPreRegRepository: Repository<StudentPreReg>,
    @InjectRepository(TutorPreReg)
    private readonly tutorPreRegRepository: Repository<TutorPreReg>,
    private readonly courseService: CourseService,
  ) {}

  getRandomElements<T>(array: T[], count: number): T[] {
    // Shuffle the array using the Fisher-Yates algorithm
    const shuffled = array.sort(() => 0.5 - Math.random());

    // Return the first `count` elements
    return shuffled.slice(0, count);
  }

  async studentPreRegP1(data: InputStudentP1RegDTO): Promise<String> {
    const checkDup = await this.studentPreRegRepository.findOne({
      where: { courseId: data.courseId, studentId: data.userId },
    });

    if (checkDup) {
      throw new ServiceException(
        ResponseCode.REGISTERED_COURSE,
        'You have registered this course',
      );
    }

    const newReg = this.studentPreRegRepository.create(data);
    await this.studentPreRegRepository.save(newReg);
    return 'You have successfully registered';
  }

  async tutorPreRegP1(data: InputTutorP1RegDTO): Promise<String> {
    const checkDup = await this.tutorPreRegRepository.findOne({
      where: { courseId: data.courseId, tutorId: data.userId },
    });

    if (checkDup) {
      throw new ServiceException(
        ResponseCode.REGISTERED_COURSE,
        'You have registered this course',
      );
    }

    const newReg = this.tutorPreRegRepository.create(data);
    await this.tutorPreRegRepository.save(newReg);
    return 'You have successfully registered';
  }

  async unregisterStudentP1(data: UnregisterStudentP1): Promise<string> {
    const deleteReg = await this.studentPreRegRepository.delete(data);
    return 'Successfully unregistered';
  }

  async unregisterTutorP1(data: UnregisterTutorP1): Promise<string> {
    const deleteReg = await this.tutorPreRegRepository.delete(data);
    return 'Successfully unregistered';
  }

  async viewRegisteredStudentP1(userId: string): Promise<CourseRegP1DTO[]> {
    const findAllViewCourse = await this.studentPreRegRepository.find({
      where: { studentId: userId },
      relations: ['course'],
    });
    const result: CourseRegP1DTO[] = [];
    findAllViewCourse.forEach((course) => {
      result.push({
        courseId: course.courseId,
        courseTitle: course.course.courseTitle,
        courseImage: course.course.courseImage,
        coursePrice: course.course.coursePrice,
        isRegistered: true,
        courseCode: course.course.courseCode,
        isOnline: course.isOnline,
      });
    });
    return result;
  }

  async viewUnregisteredRandomP1(userId: string): Promise<CourseUnRegP1DTO[]> {
    const findAllCourse = await this.courseService.findAllCourse();
    const findAllRegCourse = await this.studentPreRegRepository.find();
    const findRegisteredTable = await this.studentPreRegRepository.find({
      where: { studentId: userId },
      relations: ['course'],
    });
    const courseIdArray = [];
    const result: CourseUnRegP1DTO[] = [];
    findRegisteredTable.forEach((course) => {
      courseIdArray.push(course.courseId);
    });
    const courseCounts = findAllRegCourse.reduce((acc, record) => {
      const { courseId } = record;
      acc[courseId] = (acc[courseId] || 0) + 1; // Count occurrences
      return acc;
    }, {});
    const randomUnregisteredCourses = this.getRandomElements(findAllCourse, 5);
    randomUnregisteredCourses.forEach((course) => {
      if (!courseIdArray.includes(course.courseId)) {
        const totalRegistrationNumber = courseCounts[course.courseId] || 0;
        result.push({
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          courseImage: course.courseImage,
          coursePrice: course.coursePrice,
          isRegistered: false,
          courseCode: course.courseCode,
          registrationDate: 'default',
          totalRegistrationNumber: totalRegistrationNumber,
        });
      }
    });
    return result;
  }

  async viewUnregisteredStudentP1(userId: string): Promise<CourseUnRegP1DTO[]> {
    const findAllCourse = await this.courseService.findAllCourse();
    const findAllRegCourse = await this.studentPreRegRepository.find();
    const findRegisteredTable = await this.studentPreRegRepository.find({
      where: { studentId: userId },
      relations: ['course'],
    });
    const courseIdArray = [];
    const result: CourseUnRegP1DTO[] = [];
    findRegisteredTable.forEach((course) => {
      courseIdArray.push(course.courseId);
    });
    const courseCounts = findAllRegCourse.reduce((acc, record) => {
      const { courseId } = record;
      acc[courseId] = (acc[courseId] || 0) + 1; // Count occurrences
      return acc;
    }, {});
    findAllCourse.forEach((course) => {
      if (!courseIdArray.includes(course.courseId)) {
        const totalRegistrationNumber = courseCounts[course.courseId] || 0;
        result.push({
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          courseImage: course.courseImage,
          coursePrice: course.coursePrice,
          isRegistered: false,
          courseCode: course.courseCode,
          registrationDate: 'default',
          totalRegistrationNumber: totalRegistrationNumber,
        });
      }
    });
    return result;
  }
}
