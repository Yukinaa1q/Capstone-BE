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

export class PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

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

  async viewRegisteredStudentP1(
    userId: string,
    role: string,
    page: number = 1, // Default to page 1
    limit: number = 10,
  ): Promise<{ data: CourseRegP1DTO[]; meta: PaginationMeta }> {
    let findAllViewCourse = [];
    if (role == 'student') {
      findAllViewCourse = await this.studentPreRegRepository.find({
        where: { studentId: userId },
        relations: ['course'],
      });
    } else {
      findAllViewCourse = await this.tutorPreRegRepository.find({
        where: { tutorId: userId },
        relations: ['course'],
      });
    }
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
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = result.slice(startIndex, endIndex);

    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: paginatedResults,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
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

  async viewUnregisteredP1(
    userId: string,
    role: string,
    page: number = 1, // Default to page 1
    limit: number = 10, // Default to 10 items per page
  ): Promise<{ data: CourseUnRegP1DTO[]; meta: PaginationMeta }> {
    const findAllCourse = await this.courseService.findAllCourse();
    const findAllRegCourse = await this.studentPreRegRepository.find();
    let findRegisteredTable = [];
    if (role == 'student') {
      findRegisteredTable = await this.studentPreRegRepository.find({
        where: { studentId: userId },
        relations: ['course'],
      });
    } else {
      findRegisteredTable = await this.tutorPreRegRepository.find({
        where: { tutorId: userId },
        relations: ['course'],
      });
    }

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
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = result.slice(startIndex, endIndex);

    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: paginatedResults,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  // async viewAllocatedClasses(userId: string, role: string);
}
