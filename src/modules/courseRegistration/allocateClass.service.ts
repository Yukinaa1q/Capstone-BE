import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TutorPreReg } from './entity/tutorPreReg.entity';
import { Repository } from 'typeorm';
import { StudentPreReg } from './entity/studentPreReg.entity';
import { CourseService } from '@modules/course/course.service';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { ClassroomService } from '@modules/class/class.service';
import { CreateClassroomDTO } from '@modules/class/dto/createClassroom.dto';
import { Course } from '@modules/course/entity/course.entity';
import { generateCustomID } from '@utils';
import { Room } from './entity/room.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleStudentDividedCron() {
    await this.allocateTutortoClass();
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

  async allocateTutortoClass(): Promise<void> {
    const getAllReg = await this.tutorPreRegRepository.find({
      order: { createdTime: 'ASC' },
    });
    const distinctCourseIds = [
      ...new Set(getAllReg.map((tutor) => tutor.courseId)),
    ];
    const timeStudyShift = [
      { studyWeek: '2-4-6', studyShift: '17h45 - 19h15', isOnline: false },
      { studyWeek: '2-4-6', studyShift: '19h30 - 21h00', isOnline: true },
      { studyWeek: '3-5-7', studyShift: '17h45 - 19h15', isOnline: false },
      { studyWeek: '3-5-7', studyShift: '19h30 - 21h00', isOnline: true },
    ];
    distinctCourseIds.forEach(async (course) => {
      const getCourse = await this.courseRepository.findOne({
        where: { courseId: course },
      });
      const getAllTutorReg = await this.tutorPreRegRepository.find({
        where: { courseId: course },
        order: { createdTime: 'ASC' },
      });
      timeStudyShift.forEach(async (option) => {
        const classCode = await this.generateClassesCode();
        let getRoom = await this.roomRepository.findOne({
          where: { occupied: false },
        });
        if (!getRoom) {
          option.isOnline = true;
        }
        let roomie = '';
        option.isOnline ? (roomie = 'None') : (roomie = getRoom.roomCode);
        const createClassroomDTO = {
          courseTitle: getCourse.courseTitle,
          courseCode: getCourse.courseCode,
          maxStudents: 30,
          classCode: classCode,
          studyWeek: option.studyWeek,
          studyShift: option.studyShift,
          isOnline: option.isOnline,
          courseId: getCourse.courseId,
          classRoom: roomie,
          currentStudents: 0,
          tutorId: '',
        };
        for (let i = 0; i < getAllTutorReg.length; i++) {
          const tutor = getAllTutorReg[i];
          let check1 = '';
          let check2 = [];
          if (tutor.evenTimeShift) {
            check1 = '2-4-6';
            check2 = tutor.evenTimeShift;
          } else {
            check1 = '3-5-7';
            check2 = tutor.oddTimeShift;
          }
          if (
            check1 === option.studyWeek &&
            check2.includes(option.studyShift) &&
            tutor.courseId === getCourse.courseId
          ) {
            createClassroomDTO.tutorId = tutor.tutorId;
            const newClassroom =
              this.classroomRepository.create(createClassroomDTO);
            await this.classroomRepository.save(newClassroom);
            getCourse.classrooms.push(newClassroom);
            await this.courseRepository.save(getCourse);
            getAllTutorReg.splice(i, 1);
            break;
          }
        }
      });
    });
  }

  async studentDividedToClass(): Promise<void> {
    const getCourse = await this.studentPreRegRepository.find();
    const distinctCourseIds = [
      ...new Set(getCourse.map((course) => course.courseId)),
    ];
    distinctCourseIds.forEach(async (course) => {
      const gettAllOnlineStudent = await this.studentPreRegRepository.find({
        where: { isOnline: true, courseId: course },
        order: { createdTime: 'ASC' },
      });
      const getAllOfflineStudent = await this.studentPreRegRepository.find({
        where: { isOnline: false, courseId: course },
        order: { createdTime: 'ASC' },
      });
      const getClassesInCourse = await this.classroomRepository.find({
        where: { courseId: course },
      });
      getClassesInCourse.forEach(async (classes) => {
        if (classes.isOnline) {
          for (const student of gettAllOnlineStudent) {
            if (classes.currentStudents > classes.maxStudents) {
              break;
            }
            const getOneStudent = await this.studentRepository.findOne({
              where: { userId: student.studentId },
            });
            classes.students.push(getOneStudent);
            await this.classroomRepository.save(classes);
            getOneStudent.classrooms.push(classes);
            await this.studentRepository.save(getOneStudent);
            gettAllOnlineStudent.pop();
          }
        } else {
          for (const student of getAllOfflineStudent) {
            if (classes.currentStudents > classes.maxStudents) {
              break;
            }
            const getOneStudent = await this.studentRepository.findOne({
              where: { userId: student.studentId },
            });
            classes.students.push(getOneStudent);
            await this.classroomRepository.save(classes);
            getOneStudent.classrooms.push(classes);
            await this.studentRepository.save(getOneStudent);
            gettAllOnlineStudent.pop();
          }
        }
      });
    });
  }
}
