import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentPreReg } from './entity/studentPreReg.entity';
import { In, Like, MoreThan, Not, Repository } from 'typeorm';
import { addDays, addMonths } from 'date-fns';
import {
  CourseRegP1DTO,
  CourseUnRegP1DTO,
  InputStudentP1RegDTO,
  InputTutorP1RegDTO,
  NewTutorRegDTO,
  UnregisterStudentP1,
  UnregisterTutorP1,
} from './dto';
import { ResponseCode, ServiceException } from '@common/error';
import { TutorPreReg } from './entity/tutorPreReg.entity';
import { CourseService } from '@modules/course/course.service';
import { Course } from '@modules/course/entity/course.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { Room } from './entity/room.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { generateCustomID } from '@utils';
import { RoomOccupied } from './entity/roomOccupied.entity';
import { WherebyService } from '@services/whereby/whereby.service';

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
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly courseService: CourseService,
    @InjectRepository(Classroom)
    private readonly classRepository: Repository<Classroom>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(RoomOccupied)
    private readonly roomOccupiedRepository: Repository<RoomOccupied>,
    private readonly wherebyService: WherebyService,
  ) {}

  getRandomElements<T>(array: T[], count: number): T[] {
    // Shuffle the array using the Fisher-Yates algorithm
    const shuffled = array.sort(() => 0.5 - Math.random());

    // Return the first `count` elements
    return shuffled.slice(0, count);
  }

  async generateClassesCode(): Promise<string> {
    const lastClass = await this.classRepository
      .createQueryBuilder('classroom')
      .orderBy('classroom.classCode', 'DESC')
      .getOne();
    const lastNumber = lastClass ? parseInt(lastClass.classCode.slice(2)) : 0;
    return generateCustomID('CL', lastNumber + 1);
  }

  async studentPreRegP1(data: InputStudentP1RegDTO): Promise<string> {
    const checkDup = await this.studentPreRegRepository.findOne({
      where: { courseId: data.courseId, studentId: data.userId },
    });
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.REGISTERED_COURSE,
        'You have registered this course',
      );
    }
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: data.courseId },
    });
    findCourse.participantNumber = findCourse.participantNumber + 1;
    await this.courseRepository.save(findCourse);

    const newReg = this.studentPreRegRepository.create({
      ...data,
      studentId: data.userId,
    });
    await this.studentPreRegRepository.save(newReg);
    return 'You have successfully registered';
  }

  async tutorPreRegP1(data: InputTutorP1RegDTO): Promise<string> {
    const checkDup = await this.tutorPreRegRepository.findOne({
      where: { courseId: data.courseId, tutorId: data.tutorId },
    });

    if (checkDup) {
      throw new ServiceException(
        ResponseCode.REGISTERED_COURSE,
        'You have registered this course',
      );
    }

    const newReg = this.tutorPreRegRepository.create({
      ...data,
      tutorId: data.tutorId,
    });
    await this.tutorPreRegRepository.save(newReg);
    return 'You have successfully registered';
  }

  async unregisterStudentP1(data: UnregisterStudentP1): Promise<string> {
    const findDel = await this.studentPreRegRepository.findOne({
      where: {
        courseId: data.courseId,
        studentId: data.studentId,
      },
    });
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: data.courseId },
    });
    findCourse.participantNumber -= 1;
    await this.courseRepository.save(findCourse);
    const deleteReg = await this.studentPreRegRepository.delete(findDel.id);
    return 'Successfully unregistered';
  }

  async unregisterTutorP1(data: UnregisterTutorP1): Promise<string> {
    const deleteReg = await this.tutorPreRegRepository.delete(data);
    return 'Successfully unregistered';
  }

  async viewRegisteredStudentP1(
    userId: string,
    role: string,
  ): Promise<CourseRegP1DTO[]> {
    let findAllViewCourse = [];
    let findAllRegisterdStudents = [];
    if (role == 'student') {
      findAllViewCourse = await this.studentPreRegRepository.find({
        where: { studentId: userId },
        relations: ['course'],
      });
      const getStudentCourses = findAllViewCourse.map((course) => {
        return course.courseId;
      });
      findAllRegisterdStudents = await this.studentPreRegRepository.findBy({
        courseId: In(getStudentCourses),
      });
    } else {
      findAllViewCourse = await this.tutorPreRegRepository.find({
        where: { tutorId: userId },
        relations: ['course'],
      });
      const getStudentCourses = findAllViewCourse.map((course) => {
        return course.courseId;
      });
      findAllRegisterdStudents = await this.studentPreRegRepository.findBy({
        courseId: In(getStudentCourses),
      });
    }
    const courseCounts = findAllRegisterdStudents.reduce((acc, record) => {
      const { courseId } = record;
      acc[courseId] = (acc[courseId] || 0) + 1; // Count occurrences
      return acc;
    }, {});
    const result: CourseRegP1DTO[] = [];

    findAllViewCourse.forEach((course) => {
      const totalRegistrationNumber = courseCounts[course.courseId] || 0;
      result.push({
        courseId: course.courseId,
        courseTitle: course.course.courseTitle,
        courseImage: course.course.courseImage,
        coursePrice: course.course.coursePrice,
        isRegistered: true,
        courseCode: course.course.courseCode,
        isOnline: course.isOnline,
        totalRegistration: totalRegistrationNumber,
      });
    });

    return result;
  }

  async viewUnregisteredRandomP1(
    userId: string,
    role: string,
  ): Promise<CourseUnRegP1DTO[]> {
    let findRegisteredTable = [];
    let findAllRegCourse = [];
    if (role == 'student') {
      findAllRegCourse = await this.studentPreRegRepository.find();
      findRegisteredTable = await this.studentPreRegRepository.find({
        where: { studentId: userId },
        relations: ['course'],
      });
    } else {
      findAllRegCourse = await this.studentPreRegRepository.find();
      findRegisteredTable = await this.tutorPreRegRepository.find({
        where: { tutorId: userId },
        relations: ['course'],
      });
    }

    const findAllCourse = await this.courseRepository.findBy({
      courseId: Not(In(findRegisteredTable.map((course) => course.courseId))),
    });

    const getRandom = this.getRandomElements(findAllCourse, 5);

    const courseCounts = findAllRegCourse.reduce((acc, record) => {
      const { courseId } = record;
      acc[courseId] = (acc[courseId] || 0) + 1; // Count occurrences
      return acc;
    }, {});
    // let result = [];
    const result = getRandom.map((course) => {
      const totalRegistrationNumber = courseCounts[course.courseId] || 0;
      return {
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        courseImage: course.courseImage,
        coursePrice: course.coursePrice,
        isRegistered: false,
        courseCode: course.courseCode,
        registrationDate: 'default',
        totalRegistration: totalRegistrationNumber,
        courseSubject: course.courseSubject,
        courseLevel: course.courseLevel,
      };
    });
    return result;
  }

  async viewUnregisteredP1(
    userId: string,
    role: string,
    page: number = 1, // Default to page 1
    limit: number = 10, // Default to 10 items per page
    search: string = '',
  ): Promise<{ data: CourseUnRegP1DTO[]; meta: PaginationMeta }> {
    let findRegisteredTable = [];
    let findAllRegCourse = [];
    if (role == 'student') {
      findAllRegCourse = await this.studentPreRegRepository.find();
      findRegisteredTable = await this.studentPreRegRepository.find({
        where: { studentId: userId },
        relations: ['course'],
      });
    } else {
      findAllRegCourse = await this.studentPreRegRepository.find();
      findRegisteredTable = await this.tutorPreRegRepository.find({
        where: { tutorId: userId },
        relations: ['course'],
      });
    }

    const registeredCourseIds = findRegisteredTable.map(
      (course) => course.courseId,
    );
    // const query = await this.courseRepository
    //   .createQueryBuilder('course')
    //   .where('course.courseId NOT IN (:...registeredCourseIds)', {
    //     registeredCourseIds,
    //   });
    //   // .andWhere('LOWER(course.courseTitle) LIKE LOWER(:search)', {
    //   //   search: `%${search}%`,
    //   // });

    // const findAllCourse = await this.courseRepository.findBy({
    //   courseId: Not(In(registeredCourseIds)),
    //   courseTitle: Like(`%${search}%`),
    // });

    // const findAllCourse = await this.courseRepository.findBy({
    //   courseId: Not(In(findRegisteredTable.map((course) => course.courseId))),
    // });

    // Build the base query for unregistered courses
    const query = this.courseRepository.createQueryBuilder('course');

    // Add NOT IN clause only if registeredCourseIds is not empty
    if (registeredCourseIds.length > 0) {
      query.where('course.courseId NOT IN (:...registeredCourseIds)', {
        registeredCourseIds,
      });
    } else {
      query.where('1 = 1'); // Always true condition
    }

    // Add search filter if search term is provided
    if (search) {
      query.andWhere('LOWER(course.courseTitle) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }
    const [findAllCourse, totalItems] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const courseCounts = findAllRegCourse.reduce((acc, record) => {
      const { courseId } = record;
      acc[courseId] = (acc[courseId] || 0) + 1; // Count occurrences
      return acc;
    }, {});
    // let result = [];
    const result = findAllCourse.map((course) => {
      const totalRegistrationNumber = courseCounts[course.courseId] || 0;
      return {
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        courseImage: course.courseImage,
        coursePrice: course.coursePrice,
        isRegistered: false,
        courseCode: course.courseCode,
        registrationDate: 'default',
        totalRegistration: totalRegistrationNumber,
        courseSubject: course.courseSubject,
        courseLevel: course.courseLevel,
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

  async newTutorReg(userId: string, data: NewTutorRegDTO): Promise<string> {
    //check if that tutor is having another class of another subject at that same time

    let conditionCheck = data.registrationList.map((item) => {
      return {
        studyWeek: item.studyWeek,
        studyShift: item.studyShift,
        isOnline: item.online,
        tutorId: userId,
      };
    });

    let conditionCheck1 = data.registrationList.map((item) => {
      return {
        studyWeek: item.studyWeek,
        studyShift: item.studyShift,
        tutorId: userId,
      };
    });

    // get all classes that has the three attr
    const findTutorDup = await this.classRepository.find({
      where: conditionCheck1,
    });

    if (findTutorDup.length > 0) {
      conditionCheck = conditionCheck.filter((item) => {
        const isDup = findTutorDup.some((dup) => {
          return (
            dup.studyWeek === item.studyWeek &&
            dup.studyShift === item.studyShift &&
            dup.tutor.userId === item.tutorId
          );
        });

        return !isDup;
      });
    }

    const tutor = await this.tutorRepository.findOne({
      where: { userId },
    });
    const course = await this.courseRepository.findOne({
      where: { courseId: data.courseId },
    });

    let result: { studyShift: string; studyWeek: string }[] = [];

    for (const item of conditionCheck) {
      // check if there s room if tutor register offline class
      let roomie: Room;

      if (!item.isOnline) {
        console.log('Offline class detected');
        const occupiedRooms = await this.roomOccupiedRepository.find({
          where: {
            studyWeek: item.studyWeek,
            studyShift: item.studyShift,
          },
          select: ['roomId'], // Only get room IDs
        });

        roomie = await this.roomRepository.findOne({
          where: {
            roomId: Not(In(occupiedRooms.map((occ) => occ.roomId))),
          },
        });

        if (!roomie) {
          result.push({
            studyWeek: item.studyWeek,
            studyShift: item.studyShift,
          });
        }
      } else if (item.isOnline) {
        const url = await this.wherebyService.createMeetingLink(
          course.courseTitle,
          course.duration,
        );
        roomie = this.roomRepository.create({
          roomCode: 'Online room',
          onlineRoom: url.data.meetingUrl,
          roomAddress: url.data.meetingId,
          occupied: true,
          classesIdList: [],
        });
        await this.roomRepository.save(roomie);
      }

      if (!roomie) {
        if (result.length === conditionCheck.length) {
          return 'There is no room available for your offline class';
        }
        return 'There is no room left for your request';
      }

      const classCode = await this.generateClassesCode();
      const createClassroomDTO = {
        courseTitle: course.courseTitle,
        courseCode: course.courseCode,
        maxStudents: 30,
        classCode: classCode, // chắc classCode cũng tự tạo luôn :>>
        studyWeek: item.studyWeek,
        studyShift: item.studyShift,
        isOnline: item.isOnline,
        courseId: course.courseId,
        classRoom: roomie?.roomCode ?? 'None',
        currentStudents: 0,
        tutorId: tutor.userId,
        roomId: roomie.roomId,
        startDate: new Date().toISOString(),
        endDate: addMonths(new Date(), course.duration).toISOString(),
      };
      const newClassroom = this.classRepository.create(createClassroomDTO);
      await this.classRepository.save(newClassroom);
      course.classes.push(newClassroom.classId);
      await this.courseRepository.save(course);
      roomie.classesIdList.push(newClassroom.classId);
      await this.roomRepository.save(roomie);
      const newOccupied = this.roomOccupiedRepository.create({
        room: roomie,
        studyShift: item.studyShift,
        studyWeek: item.studyWeek,
      });
      await this.roomOccupiedRepository.save(newOccupied);
      tutor.classList.push(newClassroom.classId);
      await this.tutorRepository.save(tutor);
      // course.classrooms.push(newClassroom);
    }
    if (result.length > 0) {
      let finalString = '';
      result.forEach((item) => {
        finalString.concat(`Shift: ${item.studyShift} Day: ${item.studyWeek}`);
      });
      return finalString.concat(
        'Your others choices are accepted and class(es) created',
      );
    }
    return 'Successfully registered classes';
  }
}
