import { Classroom } from '@modules/class/entity/class.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PaginationMeta } from './courseRegistration.service';
import { addDays, addMonths } from 'date-fns';
import { Course } from '@modules/course/entity/course.entity';
import { Room } from './entity/room.entity';
import { RoomOccupied } from './entity/roomOccupied.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReturnClassPaginationDTO } from './dto/returnClass.dto';
import { WherebyService } from '@services/whereby/whereby.service';
import { Grade } from '@modules/grade/entity/grade.entity';

@Injectable()
export class CourseRegistrationP2Service {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomOccupied)
    private readonly roomOccupiedRepository: Repository<RoomOccupied>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    private readonly whereByService: WherebyService,
  ) {}

  async viewRegisteredClasses(userId: string) {
    let result = [];
    const findUserStudent = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    const findUserTutor = await this.tutorRepository.findOne({
      where: { userId: userId },
    });
    if (findUserStudent) {
      const findClasses = await this.classroomRepository.find({
        where: { classId: In(findUserStudent.classes) },
      });
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
    } else if (findUserTutor) {
      const findClasses = await this.classroomRepository.find({
        where: { classId: In(findUserTutor.classList) },
      });
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
  }

  async viewUnregisteredClassesTutor(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<{ data: Classroom[]; meta: PaginationMeta }> {
    const findTutor = await this.tutorRepository.findOne({
      where: { userId: userId },
    });
    let abc = findTutor.classList;
    const query = this.classroomRepository.createQueryBuilder('classroom');
    if (abc.length > 0) {
      query.where('classroom.classId NOT IN (:...abc)', {
        abc,
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

    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: findAllClassroom,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async viewUnregisteredClassesStudent(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<{ data: ReturnClassPaginationDTO[]; meta: PaginationMeta }> {
    const findTutor = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    let abc = findTutor.classes;
    let xyz = findTutor.paidClass;
    let wibu = ['pending'];
    const query = this.classroomRepository
      .createQueryBuilder('classroom')
      .leftJoinAndSelect('classroom.course', 'course')
      .leftJoinAndSelect('classroom.tutor', 'tutor');
    if (abc.length > 0) {
      query.where('classroom.classId NOT IN (:...abc)', {
        abc,
      });
    }
    if (xyz.length > 0) {
      query.andWhere('classroom.classId NOT IN (:...xyz)', {
        xyz,
      });
    }
    query.andWhere('classroom.status IN (:...wibu)', { wibu });
    // else {
    //   query.where('1 = 1'); // Always true condition
    // }
    if (search) {
      query.andWhere('LOWER(classroom.courseTitle) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }
    const [findAllClassroom, totalItems] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const result: ReturnClassPaginationDTO[] = [];
    for (const item of findAllClassroom) {
      result.push({
        courseTitle: item.courseTitle,
        courseCode: item.courseCode,
        courseId: item.courseId,
        coursePrice: item.course.coursePrice,
        courseImage: item.course.courseImage,
        classId: item.classId,
        classCode: item.classCode,
        registrationStartDate: new Date(item.startDate).toLocaleDateString(
          'en-GB',
        ),
        registrationEndDate: addDays(
          new Date(item.startDate),
          10,
        ).toLocaleDateString('en-GB'),
        tutor: item.tutor.name,
        currentStudents: item.currentStudents,
        maxStudents: item.maxStudents,
      });
    }
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

  async viewRandomUnregisteredClasses(userId: string) {
    const unregisteredClasses = await this.classroomRepository
      .createQueryBuilder('classroom')
      .leftJoinAndSelect('classroom.course', 'course')
      .leftJoinAndSelect('classroom.tutor', 'tutor')
      .where('NOT (:userId = ANY(classroom.studentList))', { userId })
      .take(5)
      .getMany();

    const result = [];
    unregisteredClasses.forEach((item) =>
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
      }),
    );
    return result;
  }

  async registerClassStudent(userId: string, classId: string): Promise<string> {
    const findUser = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    const findClass = await this.classroomRepository.findOne({
      where: { classId: classId },
    });
    findUser.classes.push(findClass.classId);
    findUser.classrooms.push(findClass);
    await this.studentRepository.save(findUser);
    findClass.studentList.push(findUser.userId);
    findClass.students.push(findUser);
    await this.classroomRepository.save(findClass);
    return 'Successfully registered';
  }

  async unregisterClassStudent(
    userId: string,
    classId: string,
  ): Promise<string> {
    const findUser = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    const findClass = await this.classroomRepository.findOne({
      where: { classId: classId },
    });

    findUser.classes = findUser.classes.filter(
      (curenntClassId) => curenntClassId !== classId,
    );
    findClass.studentList = findClass.studentList.filter(
      (student) => student !== userId,
    );
    findClass.currentStudents = findClass.currentStudents - 1;
    await this.studentRepository.save(findUser);
    await this.classroomRepository.save(findClass);
    return 'Student successfully unregistered from the class';
  }

  async deleteClass(classId: string): Promise<string> {
    //xóa trong student trước
    const findStudent = await this.studentRepository
      .createQueryBuilder('student')
      .where(':classId = ANY(student.classes)', { classId })
      .orWhere(':classId = ANY(student.paidClass)', { classId })
      .getMany();

    await Promise.all(
      findStudent.map(async (student) => {
        student.classes = student.classes.filter(
          (currentClassId) => currentClassId !== classId,
        );
        student.paidClass = student.paidClass.filter(
          (currentClassId) => currentClassId !== classId,
        );
        return this.studentRepository.save(student);
      }),
    );
    //xóa trong tutor
    const findTutor = await this.tutorRepository
      .createQueryBuilder('tutor')
      .where(':classId = ANY(tutor.classList)', { classId })
      .orWhere(':classId = ANY(tutor.paidClassList)', { classId })
      .getOne();

    findTutor.classList = findTutor.classList.filter(
      (currentClassId) => currentClassId !== classId,
    );
    findTutor.paidClassList = findTutor.paidClassList.filter(
      (currentClassId) => currentClassId !== classId,
    );
    await this.tutorRepository.save(findTutor);

    //xóa tiếp trong course
    const findCourse = await this.courseRepository
      .createQueryBuilder('course')
      .where(':classId = ANY(course.classes)', { classId })
      .getOne();
    if (findCourse) {
      findCourse.classes = findCourse.classes.filter(
        (currentClassId) => currentClassId !== classId,
      );
      await this.courseRepository.save(findCourse);
    }

    //xóa trong room
    const findRoom = await this.roomRepository
      .createQueryBuilder('room')
      .where(':classId = ANY(room.classesIdList)', { classId })
      .getOne();

    //xóa trong roomOccupied
    const findRoomOc = await this.roomOccupiedRepository.findOneBy({
      roomId: findRoom.roomId,
    });
    findRoom.classesIdList = findRoom.classesIdList.filter(
      (classs) => classs !== classId,
    );

    //xóa trong grade
    const findGrade = await this.gradeRepository.find({
      where: { classroomId: classId },
    });
    if (findGrade && findGrade.length > 0) {
      for (const grade of findGrade) {
        await this.gradeRepository.delete(grade.gradeId);
      }
    }

    await this.roomOccupiedRepository.delete(findRoomOc.id);
    await this.roomRepository.save(findRoom);
    await this.classroomRepository.delete(classId);
    if (findRoom.onlineRoom) {
      const check = await this.whereByService.deleteMeeting(
        findRoom.roomAddress,
      );
      await this.roomRepository.delete(findRoom.roomId);
    }
    return 'The class is successfully deleted';
  }

  async searchUserForTimetable(search: string = '') {
    if (!search) {
      return [];
    }
    try {
      // Run both queries concurrently
      const [students, tutors] = await Promise.all([
        this.studentRepository
          .createQueryBuilder('student')
          .where('LOWER(student.name) LIKE LOWER(:search)', {
            search: `%${search}%`,
          })
          .getMany(),
        this.tutorRepository
          .createQueryBuilder('tutor')
          .where('LOWER(tutor.name) LIKE LOWER(:search)', {
            search: `%${search}%`,
          })
          .getMany(),
      ]);
      const result = [
        ...students.map((item) => ({
          userId: item.userId,
          userCode: item.studentCode,
          name: item.name,
          avatarUrl: item.avatarUrl || 'None',
        })),
        ...tutors.map((item) => ({
          userId: item.userId,
          userCode: item.tutorCode,
          name: item.name,
          avatarUrl: item.avatarUrl || 'None',
        })),
      ];

      return result;
    } catch (error) {
      // Handle errors appropriately
      throw new Error('Failed to search users');
    }
  }

  async showTimetable(userId: string) {
    const [student, tutor] = await Promise.all([
      this.studentRepository.findOne({ where: { userId: userId } }),
      this.tutorRepository.findOne({ where: { userId: userId } }),
    ]);
    if (student) {
      const [findPaidClass, findCurrentClass] = await Promise.all([
        await this.classroomRepository.find({
          where: {
            classId: In(student.paidClass),
          },
        }),
        await this.classroomRepository.find({
          where: {
            classId: In(student.classes),
            status: Not(In(['pending'])),
          },
        }),
      ]);

      let result = [];
      if (findPaidClass && findPaidClass.length > 0) {
        result = result.concat(
          findPaidClass.map((item) => {
            return {
              subject: item.course.courseTitle,
              studyWeek: item.studyWeek,
              studyShift: item.studyShift,
              room: item.room.roomCode,
              address: item.room.onlineRoom || item.room.roomAddress,
            };
          }),
        );
      }
      if (findCurrentClass && findCurrentClass.length > 0) {
        result = result.concat(
          findCurrentClass.map((item) => {
            return {
              subject: item.course.courseTitle,
              studyWeek: item.studyWeek,
              studyShift: item.studyShift,
              room: item.room.roomCode,
              address: item.room.onlineRoom || item.room.roomAddress,
            };
          }),
        );
      }
      return result;
    }
    if (tutor) {
      const findCurrentClass = await this.classroomRepository.find({
        where: {
          classId: In(tutor.paidClassList),
          status: Not(In(['pending'])),
        },
      });
      const result = findCurrentClass.map((item) => {
        return {
          subject: item.course.courseTitle,
          studyWeek: item.studyWeek,
          studyShift: item.studyShift,
          room: item.room.roomCode,
          address: item.room.onlineRoom || item.room.roomAddress,
        };
      });
      return result;
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async runCron() {
    console.log('Running cron job every 5 seconds');
    await this.checkClassStatus();
    await this.checkPayment();
  }

  async checkPayment() {
    const allClasses = await this.classroomRepository.find({
      where: { status: 'open' },
    });
    for (const aClass of allClasses) {
      // const findStudentInClass = await this.studentRepository.find({
      //   where: { classes: In([aClass.classId]) },
      // });
      let classId = aClass.classId;

      const findStudentInClass = await this.studentRepository
        .createQueryBuilder('student')
        .where(':classId = ANY(student.classes)', { classId })
        .getMany();

      for (const student of findStudentInClass) {
        if (!student.paidClass.includes(aClass.classId)) {
          const removeClass = student.classes.indexOf(aClass.classId);
          student.classes.splice(removeClass, 1);
          const removeStudent = aClass.studentList.indexOf(student.userId);
          aClass.studentList.splice(removeStudent, 1);
          aClass.currentStudents = aClass.currentStudents - 1;
          const findGrade = await this.gradeRepository.findOne({
            where: { studentId: student.userId, classroomId: aClass.classId },
          });
          if (findGrade) await this.gradeRepository.delete(findGrade.gradeId);
          await this.studentRepository.save(student);
          await this.classroomRepository.save(aClass);
        }
      }
    }
  }

  async checkClassStatus() {
    const today = new Date();
    const allClasses = await this.classroomRepository.find();
    for (const aClass of allClasses) {
      if (aClass.status !== 'open') {
        if (
          today >= addDays(new Date(aClass.startDate), 10) &&
          aClass.currentStudents < Math.ceil(aClass.maxStudents / 3) &&
          aClass.status === 'pending'
        ) {
          const deleteClass = await this.deleteClass(aClass.classId);
        } else if (
          today >= addDays(new Date(aClass.startDate), 10) &&
          aClass.currentStudents >= Math.ceil(aClass.maxStudents / 3) &&
          aClass.status === 'pending'
        ) {
          aClass.status = 'payment';
          const findTutor = await this.tutorRepository.findOne({
            where: { userId: aClass.tutorId },
          });
          findTutor.paidClassList.push(aClass.classId);
          findTutor.classList = findTutor.classList.filter(
            (item) => !findTutor.paidClassList.includes(item),
          );
          await this.tutorRepository.save(findTutor);
          await this.classroomRepository.save(aClass);
        } else if (today >= addDays(new Date(aClass.startDate), 20)) {
          aClass.status = 'open';
          await this.classroomRepository.save(aClass);
        }
      }

      if (aClass.status === 'open') {
        if (
          today >= addMonths(new Date(aClass.startDate), aClass.course.duration)
        ) {
          aClass.status = 'close';
          await this.classroomRepository.save(aClass);
        }
      }
    }
  }
}
