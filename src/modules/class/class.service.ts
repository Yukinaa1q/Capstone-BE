import { ResponseCode, ServiceException } from '@common/error';
import { CourseService } from '@modules/course/course.service';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateClassroomDTO } from './dto/createClassroom.dto';
import { UpdateClassroomDTO } from './dto/updateClassroom.dto';
import { ViewAllClassroomDTO } from './dto/viewAllClassroom.dto';
import { ViewClassDetailDTO } from './dto/viewClassDetail.dto';
import { Classroom } from './entity/class.entity';
import { addDays, addMonths } from 'date-fns';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly courseService: CourseService,
  ) {}

  async createClass(data: CreateClassroomDTO): Promise<Classroom> {
    const checkDup = await this.findOneClass(data.classCode);
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.DUPLICATE_CLASS,
        'Duplicate Class',
      );
    }
    const findTutor = await this.tutorRepository.findOne({
      where: { tutorCode: data.tutorCode },
    });
    const findCourse = await this.courseService.findOneCourse(data.courseCode);
    const findStudents = await this.studentRepo.findBy({
      userId: In(data.studentIdList),
    });
    const newClass = this.classroomRepository.create({
      tutorId: findTutor.userId,
      courseId: findCourse.courseId,
      students: findStudents,
      currentStudents: findStudents.length,
      ...data,
    });
    await this.classroomRepository.save(newClass);
    return newClass;
  }

  async updateClass(
    classId: string,
    data: UpdateClassroomDTO,
  ): Promise<Classroom> {
    const findTutor = await this.tutorRepository.findOne({
      where: { tutorCode: data.tutorCode },
    });
    const findCourse = await this.courseService.findOneCourse(data.courseCode);
    data.tutorId = findTutor.userId;
    data.courseId = findCourse.courseId;
    if (data.studentIdList) {
      const findStudents = await this.studentRepo.findBy({
        userId: In(data.studentIdList),
      });
      data.students = findStudents;
      delete data.studentIdList;
    }
    const findClass = await this.classroomRepository.findOne({
      where: { classId: classId },
    });

    findClass.currentStudents = data.students.length;

    await this.classroomRepository.save({
      ...findClass,
      ...data,
    });
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
        room: classs.classRoom || 'N/A',
        openStatus: 'not open',
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
      15,
    ).toLocaleDateString();
    result.studyStartDate = addDays(
      new Date(findClass.startDate),
      15,
    ).toLocaleDateString();
    result.studyEndDate = addMonths(
      addDays(new Date(findClass.startDate), 15),
      findClass.course.duration,
    ).toLocaleDateString();
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
    findClass.studentList.map(async (student) => {
      const findStudent = await this.studentRepo.findOne({
        where: { userId: student },
      });
      result.studentList.push({
        studentName: findStudent.name,
        studentId: findStudent.userId,
        studentCode: findStudent.studentCode,
        avatarLink: findStudent.avatarUrl,
      });
    });
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
