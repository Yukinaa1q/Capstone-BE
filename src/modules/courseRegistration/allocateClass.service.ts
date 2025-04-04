import { Classroom } from '@modules/class/entity/class.entity';
import { Course } from '@modules/course/entity/course.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { generateCustomID, hasThreeMatchingAttributes } from '@utils';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Room } from './entity/room.entity';
import { StudentPreReg } from './entity/studentPreReg.entity';
import { TutorPreReg } from './entity/tutorPreReg.entity';

@Injectable()
export class AllocateClassService {
  constructor(
    @InjectRepository(TutorPreReg)
    private readonly tutorPreRegRepository: Repository<TutorPreReg>,
    @InjectRepository(StudentPreReg)
    private readonly studentPreRegRepository: Repository<StudentPreReg>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  // @Cron(CronExpression.EVERY_5_HOURS)
  async handleStudentDividedCron() {
    await this.createClass();
    await this.studentDividedToClass();
  }

  async generateClassesCode(): Promise<string> {
    const lastClass = await this.classroomRepository
      .createQueryBuilder('classroom')
      .orderBy('classroom.classCode', 'DESC')
      .getOne();
    const lastNumber = lastClass ? parseInt(lastClass.classCode.slice(2)) : 0;
    return generateCustomID('CL', lastNumber + 1);
  }

  async createClass(): Promise<void> {
    const getAllReg = await this.tutorPreRegRepository.find({
      order: { createdTime: 'ASC' },
    });

    const checkSameTime = [];
    for (const registration of getAllReg) {
      const classCode = await this.generateClassesCode();
      const shiftAndWeek = [];
      if (registration.evenTimeShift.length != 0) {
        registration.evenTimeShift.forEach((item) => {
          shiftAndWeek.push({ sWeek: '2-4-6', sShift: item });
        });
      }
      if (registration.oddTimeShift.length != 0) {
        registration.oddTimeShift.forEach((item) => {
          shiftAndWeek.push({ sWeek: '3-5-7', sShift: item });
        });
      }

      // if (registration.evenTimeShift.length != 0) {
      //   sWeek = '2-4-6';
      //   sShift = registration.evenTimeShift[0];
      //   if (registration.evenTimeShift.length == 2) {
      //     sShift = registration.evenTimeShift[0];
      //     const checkMatchingClass = hasThreeMatchingAttributes(checkSameTime, {
      //       courseId: registration.courseId,
      //       sShift: sShift,
      //       sWeek: sWeek,
      //     });
      //     if (checkMatchingClass) {
      //       sShift = registration.evenTimeShift[1];
      //     }
      //   }
      // } else if (registration.oddTimeShift.length != 0) {
      //   sWeek = '3-5-7';
      //   sShift = registration.oddTimeShift[0];
      //   if (registration.oddTimeShift.length == 2) {
      //     sShift = registration.oddTimeShift[0];
      //     const checkMatchingClass = hasThreeMatchingAttributes(checkSameTime, {
      //       courseId: registration.courseId,
      //       sShift: sShift,
      //       sWeek: sWeek,
      //     });
      //     if (checkMatchingClass) {
      //       sShift = registration.oddTimeShift[1];
      //     }
      //   }
      // }
      for (const item of shiftAndWeek) {
        let isOnl = true;
        if (item.sWeek == '2-4-6') {
          isOnl = true;
        } else if (item.sWeek == '3-5-7') {
          isOnl = false;
        }

        const checkMatchingShift = hasThreeMatchingAttributes(checkSameTime, {
          tutorId: registration.tutorId,
          sShift: item.sShift,
          sWeek: item.sWeek,
        });

        const checkMatchingClass = hasThreeMatchingAttributes(checkSameTime, {
          courseId: registration.courseId,
          sShift: item.sShift,
          sWeek: item.sWeek,
        });

        if (checkMatchingShift || checkMatchingClass) {
          continue;
        }

        let roomie: Room = null;
        if (!isOnl) {
          roomie = await this.roomRepository.findOne({
            where: { maxClasses: MoreThan(0) },
          });
        }

        if (!roomie) {
          isOnl = true;
          roomie = await this.roomRepository.findOne({
            where: { maxClasses: MoreThan(0) },
          });
          //roomie = this.roomRepository.create()//create Online classroom here, will be implemented in the future
        }

        checkSameTime.push({
          tutorId: registration.tutorId,
          courseId: registration.courseId,
          sShift: item.sShift,
          sWeek: item.sWeek,
        });

        const tutor = await this.tutorRepository.findOne({
          where: { userId: registration.tutorId },
        });
        const course = await this.courseRepository.findOne({
          where: { courseId: registration.courseId },
        });
        const createClassroomDTO = {
          courseTitle: registration.course.courseTitle,
          courseCode: registration.course.courseCode,
          maxStudents: 30,
          classCode: classCode, // chắc classCode cũng tự tạo luôn :>>
          studyWeek: item.sWeek,
          studyShift: item.sShift,
          isOnline: isOnl,
          courseId: registration.courseId,
          classRoom: roomie?.roomCode ?? 'None',
          currentStudents: 0,
          tutorId: registration.tutorId,
          roomId: roomie.roomId,
        };
        const newClassroom =
          this.classroomRepository.create(createClassroomDTO);
        await this.classroomRepository.save(newClassroom);
        registration.course.classes.push(newClassroom.classId);
        await this.courseRepository.save(registration.course);
        roomie.classesIdList.push(newClassroom.classId);
        roomie.maxClasses = roomie.maxClasses - 1;
        await this.roomRepository.save(roomie);
        tutor.classList.push(newClassroom.classId);
        tutor.classrooms.push(newClassroom);
        await this.tutorRepository.save(tutor);
        course.classes.push(newClassroom.classId);
        course.classrooms.push(newClassroom);
        await this.courseRepository.save(course);
      }
    }
  }

  // async studentDividedToClass(): Promise<void> {
  //   console.log('below func');
  //   const getCourse = await this.studentPreRegRepository.find();
  //   const distinctCourseIds = [
  //     ...new Set(getCourse.map((course) => course.courseId)),
  //   ];
  //   distinctCourseIds.forEach(async (course) => {
  //     const gettAllOnlineStudent = await this.studentPreRegRepository.find({
  //       where: { isOnline: true, courseId: course },
  //       order: { createdTime: 'ASC' },
  //     });
  //     const getAllOfflineStudent = await this.studentPreRegRepository.find({
  //       where: { isOnline: false, courseId: course },
  //       order: { createdTime: 'ASC' },
  //     });

  //     const getClassesInCourse = await this.classroomRepository.find({
  //       where: { courseId: course },
  //     });
  //     getClassesInCourse.forEach(async (classes) => {
  //       if (classes.isOnline) {
  //         for (const student of gettAllOnlineStudent) {
  //           if (classes.currentStudents > classes.maxStudents) {
  //             break;
  //           }
  //           const getOneStudent = await this.studentRepository.findOne({
  //             where: { userId: student.studentId },
  //           });
  //           classes.students.push(getOneStudent);
  //           await this.classroomRepository.save(classes);
  //           getOneStudent.classrooms.push(classes);
  //           await this.studentRepository.save(getOneStudent);
  //           gettAllOnlineStudent.pop();
  //         }
  //       } else {
  //         for (const student of getAllOfflineStudent) {
  //           if (classes.currentStudents > classes.maxStudents) {
  //             break;
  //           }
  //           const getOneStudent = await this.studentRepository.findOne({
  //             where: { userId: student.studentId },
  //           });
  //           classes.students.push(getOneStudent);
  //           await this.classroomRepository.save(classes);
  //           getOneStudent.classrooms.push(classes);
  //           await this.studentRepository.save(getOneStudent);
  //           gettAllOnlineStudent.pop();
  //         }
  //       }
  //     });
  //   });
  // }
  async studentDividedToClass(): Promise<void> {
    console.log('Starting student division into classes...');

    // Fetch all student registrations
    const getCourse = await this.studentPreRegRepository.find();
    const distinctCourseIds = [
      ...new Set(getCourse.map((course) => course.courseId)),
    ];

    // Process each course
    for (const courseId of distinctCourseIds) {
      console.log(`Processing course: ${courseId}`);

      // Fetch all online and offline students for the course
      const gettAllOnlineStudent = await this.studentPreRegRepository.find({
        where: { isOnline: true, courseId },
        order: { createdTime: 'ASC' },
      });
      const getAllOfflineStudent = await this.studentPreRegRepository.find({
        where: { isOnline: false, courseId },
        order: { createdTime: 'ASC' },
      });

      // Fetch all classes for the course
      const getClassesInCourse = await this.classroomRepository.find({
        where: { courseId },
      });

      // Divide online students into online classes
      await this.divideStudentsIntoClasses(
        gettAllOnlineStudent,
        getClassesInCourse.filter((classroom) => classroom.isOnline),
        15, // Max students per class
      );

      // Divide offline students into offline classes
      await this.divideStudentsIntoClasses(
        getAllOfflineStudent,
        getClassesInCourse.filter((classroom) => !classroom.isOnline),
        15, // Max students per class
      );
    }

    console.log('Student division into classes completed.');
  }

  /**
   * Divides students into classes, ensuring no class exceeds the maxStudents limit.
   * If there are remaining students after filling all classes, distributes them starting from the first class again.
   */
  async divideStudentsIntoClasses(
    students: StudentPreReg[], // List of students to divide
    classrooms: Classroom[], // List of classrooms to fill
    maxStudentsPerClass: number, // Max students per class
  ): Promise<void> {
    if (students.length === 0 || classrooms.length === 0) {
      console.log('No students or classrooms to process.');
      return;
    }

    let studentIndex = 0;

    // First pass: Fill each class up to maxStudentsPerClass
    for (const classroom of classrooms) {
      while (
        studentIndex < students.length &&
        classroom.studentList.length < maxStudentsPerClass
      ) {
        const student = students[studentIndex];
        const studentDetails = await this.studentRepository.findOne({
          where: { userId: student.studentId },
        });

        if (studentDetails) {
          classroom.studentList.push(student.studentId);
          classroom.students.push(studentDetails);
          studentDetails.classrooms.push(classroom);
          studentDetails.classes.push(classroom.classId);
          await this.classroomRepository.save(classroom);
          await this.studentRepository.save(studentDetails);
        }

        studentIndex++;
      }
    }

    // Second pass: Distribute remaining students starting from the first class
    while (studentIndex < students.length) {
      for (const classroom of classrooms) {
        if (studentIndex >= students.length) break;

        const student = students[studentIndex];
        const studentDetails = await this.studentRepository.findOne({
          where: { userId: student.studentId },
        });

        if (studentDetails) {
          classroom.students.push(studentDetails);
          studentDetails.classrooms.push(classroom);
          await this.classroomRepository.save(classroom);
          await this.studentRepository.save(studentDetails);
        }

        studentIndex++;
      }
    }

    console.log(
      `Divided ${students.length} students into ${classrooms.length} classrooms.`,
    );
  }
}
