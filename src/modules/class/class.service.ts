import { ResponseCode, ServiceException } from '@common/error';
import { CourseService } from '@modules/course/course.service';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CreateClassroomDTO } from './dto/createClassroom.dto';
import { UpdateClassroomDTO } from './dto/updateClassroom.dto';
import { ViewAllClassroomDTO } from './dto/viewAllClassroom.dto';
import { ViewClassDetailDTO } from './dto/viewClassDetail.dto';
import { Classroom } from './entity/class.entity';
import { addDays, addMonths } from 'date-fns';
import { RoomOccupied } from '@modules/courseRegistration/entity/roomOccupied.entity';
import { Room } from '@modules/courseRegistration/entity/room.entity';
import { WherebyService } from '@services/whereby/whereby.service';
import { Course } from '@modules/course/entity/course.entity';
import { generateCustomID } from '@utils';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(RoomOccupied)
    private readonly roomOccupiedRepository: Repository<RoomOccupied>,
    private readonly courseService: CourseService,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly wherebyService: WherebyService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}
  async generateClassesCode(): Promise<string> {
    const lastClass = await this.classroomRepository
      .createQueryBuilder('classroom')
      .orderBy('classroom.classCode', 'DESC')
      .getOne();
    const lastNumber = lastClass ? parseInt(lastClass.classCode.slice(2)) : 0;
    return generateCustomID('CL', lastNumber + 1);
  }

  // async createClass(data: CreateClassroomDTO): Promise<Classroom> {
  //   const checkDup = await this.findOneClass(data.classCode);
  //   if (checkDup) {
  //     throw new ServiceException(
  //       ResponseCode.DUPLICATE_CLASS,
  //       'Duplicate Class',
  //     );
  //   }
  //   const findTutor = await this.tutorRepository.findOne({
  //     where: { tutorCode: data.tutorCode },
  //   });
  //   const findCourse = await this.courseService.findOneCourse(data.courseCode);
  //   const findStudents = await this.studentRepo.findBy({
  //     userId: In(data.studentIdList),
  //   });
  //   const newClass = this.classroomRepository.create({
  //     tutorId: findTutor.userId,
  //     courseId: findCourse.courseId,
  //     students: findStudents,
  //     currentStudents: findStudents.length,
  //     ...data,
  //   });
  //   await this.classroomRepository.save(newClass);
  //   return newClass;
  // }
  async createClass(data: CreateClassroomDTO): Promise<Classroom | string> {
    // Check if class code already exists
    // const checkDup = await this.findOneClass(data.classCode);
    // if (checkDup) {
    //   throw new ServiceException(
    //     ResponseCode.DUPLICATE_CLASS,
    //     'Duplicate Class',
    //   );
    // }

    // Find tutor and course
    const tutor = await this.tutorRepository.findOne({
      where: { tutorCode: data.tutorCode },
    });

    const course = await this.courseService.findOneCourse(data.courseCode);

    // Check tutor qualification
    let checkTutorQualification = false;
    for (const item of tutor.qualifiedSubject) {
      if (
        item.subject === course.courseSubject &&
        parseInt(item.level) >= parseInt(course.courseLevel)
      ) {
        checkTutorQualification = true;
        break;
      }
    }

    if (!checkTutorQualification) {
      return 'This tutor is not qualified to teach this course';
    }

    // Check if the tutor already has a class at the given time
    const existingClass = await this.classroomRepository.findOne({
      where: {
        studyWeek: data.studyWeek,
        studyShift: data.studyShift,
        tutorId: tutor.userId,
      },
    });

    if (existingClass) {
      return `Tutor already has a class at ${data.studyWeek}, shift ${data.studyShift}`;
    }

    // Find available room if class is offline
    let roomie: Room;

    if (!data.isOnline) {
      console.log('Offline class being created');
      const occupiedRooms = await this.roomOccupiedRepository.find({
        where: {
          studyWeek: data.studyWeek,
          studyShift: data.studyShift,
        },
        select: ['roomId'],
      });

      roomie = await this.roomRepository.findOne({
        where: {
          roomId: Not(In(occupiedRooms.map((occ) => occ.roomId))),
          onlineRoom: IsNull(),
        },
      });

      if (!roomie) {
        return 'There is no room available for this offline class';
      }
    } else {
      // Create online room through whereby service
      const url = await this.wherebyService.createMeetingLink(
        course.courseTitle,
        course.duration,
      );
      roomie = this.roomRepository.create({
        roomCode: 'Online room',
        onlineRoom: url.data.hostRoomUrl,
        roomAddress: url.data.meetingId,
        occupied: true,
        classesIdList: [],
      });
      await this.roomRepository.save(roomie);
    }

    // Find students if they exist in the request
    let students = [];
    let studentIdList = [];
    if (data.studentIdList && data.studentIdList.length > 0) {
      students = await this.studentRepo.findBy({
        userId: In(data.studentIdList),
      });
      studentIdList = data.studentIdList;
    }

    // Create new classroom
    const classCode = await this.generateClassesCode();
    const newClassroom = this.classroomRepository.create({
      courseTitle: course.courseTitle,
      courseCode: course.courseCode,
      maxStudents: data.maxStudents || 30,
      classCode: classCode,
      studyWeek: data.studyWeek,
      studyShift: data.studyShift,
      isOnline: data.isOnline,
      courseId: course.courseId,
      classRoom: roomie.roomCode,
      currentStudents: studentIdList.length,
      tutorId: tutor.userId,
      studentList: studentIdList,
      students: students,
      roomId: roomie.roomId,
      status: 'pending',
      startDate: new Date().toISOString(),
      endDate: addMonths(new Date(), course.duration).toISOString(),
    });

    await this.classroomRepository.save(newClassroom);

    // Update related entities
    course.classes.push(newClassroom.classId);
    await this.courseRepository.save(course);

    roomie.classesIdList.push(newClassroom.classId);
    await this.roomRepository.save(roomie);

    const newOccupied = this.roomOccupiedRepository.create({
      room: roomie,
      studyShift: data.studyShift,
      studyWeek: data.studyWeek,
    });

    await this.roomOccupiedRepository.save(newOccupied);

    tutor.classList.push(newClassroom.classId);
    await this.tutorRepository.save(tutor);

    if (studentIdList.length > 0) {
      const findStudents = await this.studentRepo.find({
        where: { userId: In(studentIdList) },
      });

      findStudents.map(async (item) => {
        item.paidClass.push(newClassroom.classId);
        await this.studentRepo.save(item);
      });
    }

    return newClassroom;
  }

  async updateClass(
    classId: string,
    data: UpdateClassroomDTO,
  ): Promise<Classroom> {
    // const findTutor = await this.tutorRepository.findOne({
    //   where: { tutorCode: data.tutorCode },
    // });
    // const findCourse = await this.courseService.findOneCourse(data.courseCode);
    // data.tutorId = findTutor.userId;
    // data.courseId = findCourse.courseId;
    // if (data.studentIdList) {
    //   const findStudents = await this.studentRepo.findBy({
    //     userId: In(data.studentIdList),
    //   });
    //   data.students = findStudents;
    // }
    const findClass = await this.classroomRepository.findOne({
      where: { classId: classId },
    });

    const findStudents = await this.studentRepo.find({
      where: { userId: In(data.studentIdList) },
    });
    console.log(data.studentIdList);
    if (data.studentIdList) {
      if (data.studentIdList.length > findClass.studentList.length) {
        findStudents.map(async (item) => {
          if (!findClass.studentList.includes(item.userId)) {
            findClass.currentStudents = data.studentIdList.length;
            findClass.studentList.push(item.userId);
            item.paidClass.push(findClass.classId);
            await this.studentRepo.save(item);
          }
        });
        await this.classroomRepository.save(findClass);
      } else if (data.studentIdList.length < findClass.studentList.length) {
        // Removing students
        findClass.currentStudents = data.studentIdList.length;

        // Find students to remove (those in old list but not in new list)
        const studentsToRemove = findClass.studentList.filter(
          (studentId) => !data.studentIdList.includes(studentId),
        );

        // Update class's student list directly with filter
        findClass.studentList = findClass.studentList.filter((studentId) =>
          data.studentIdList.includes(studentId),
        );

        // Remove those students
        for (const studentIdToRemove of studentsToRemove) {
          // Also update the student record
          const student = await this.studentRepo.findOne({
            where: { userId: studentIdToRemove },
          });

          if (student) {
            const classIndex = student.paidClass.indexOf(findClass.classId);
            if (classIndex !== -1) {
              student.paidClass.splice(classIndex, 1);
              await this.studentRepo.save(student);
            }
          }
        }
        await this.classroomRepository.save(findClass);
      }
    }

    // await this.classroomRepository.save({
    //   ...findClass,
    //   ...data,
    // });
    const updateClass = await this.classroomRepository.findOne({
      where: { classId: classId },
    });
    return updateClass;
  }

  async viewClasses(): Promise<ViewAllClassroomDTO[]> {
    const classes = await this.classroomRepository.find();
    const result: ViewAllClassroomDTO[] = [];
    classes.forEach((classs) => {
      result.push({
        classId: classs.classId,
        classCode: classs.classCode,
        classStudents: classs.maxStudents,
        classRegisteredStudents: classs.currentStudents,
        tutorId: classs.tutor.tutorCode,
        tutor: classs.tutor.name,
        room: classs.room.onlineRoom || classs.room.roomCode,
        openStatus: classs.status,
        courseName: classs.courseTitle,
      });
      //temporary solution
    });
    return result;
  }

  async viewClassDetail(classId: string): Promise<ViewClassDetailDTO> {
    const findClass = await this.classroomRepository.findOne({
      where: { classCode: classId },
    });
    // console.log(findClass);
    const result = {} as ViewClassDetailDTO;
    result.courseTitle = findClass.course.courseTitle;
    result.courseCode = findClass.courseCode;
    result.courseImage = findClass.course.courseImage;
    result.registrationStartDate = new Date(
      findClass.startDate,
    ).toLocaleDateString();
    result.registrationEndDate = addDays(
      new Date(findClass.startDate),
      10,
    ).toLocaleDateString();
    result.studyStartDate = addDays(
      new Date(findClass.startDate),
      11,
    ).toLocaleDateString('en-GB');
    result.studyEndDate = addMonths(
      addDays(new Date(findClass.startDate), 11),
      findClass.course.duration,
    ).toLocaleDateString('en-GB');
    result.tutor = findClass.tutor.name;
    result.tutorId = findClass.tutor.tutorCode;
    result.courseDescription = findClass.course.courseDescription;
    result.courseOutline = findClass.course.courseOutline;
    result.coursePrice = findClass.course.coursePrice;
    result.classSession = findClass.studyWeek;
    result.classShift = findClass.studyShift;
    result.classId = findClass.classId;
    result.learningType = findClass.isOnline;
    result.classCode = findClass.classCode;
    result.studyRoom = findClass.classRoom;
    result.classStudents = findClass.currentStudents;
    result.classMaxStudents = findClass.maxStudents;
    result.studentList = [];
    for (const student of findClass.studentList) {
      const findStudent = await this.studentRepo.findOne({
        where: { userId: student },
      });
      result.studentList.push({
        studentName: findStudent.name,
        studentId: findStudent.userId,
        studentCode: findStudent.studentCode,
        avatarLink: findStudent.avatarUrl,
      });
    }
    return result;
  }

  async deleteClass(classId: string): Promise<string> {
    await this.classroomRepository.delete(classId);
    return 'The class is successfully deleted';
  }

  async findOneClass(data: string): Promise<Classroom> {
    const result = await this.classroomRepository.findOne({
      where: { classCode: data },
    });
    return result;
  }
}
