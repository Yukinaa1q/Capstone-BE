import { Classroom } from '@modules/class/entity/class.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PaginationMeta } from './courseRegistration.service';
import { addDays, addMonths } from 'date-fns';

@Injectable()
export class CourseRegistrationP2Service {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async viewRegisteredClassesStudent(userId: string): Promise<Classroom[]> {
    let result: Classroom[] = [];
    const findUser = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    const findClasses = await this.classroomRepository.find({
      where: { classId: In(findUser.classes) },
    });
    for (const item of findClasses) {
      result.push(item);
    }
    return result;
  }

  async viewRegisteredClassesTutor(userId: string): Promise<Classroom[]> {
    let result: Classroom[] = [];
    const findUser = await this.tutorRepository.findOne({
      where: { userId: userId },
    });
    const findClasses = await this.classroomRepository.find({
      where: { classId: In(findUser.classList) },
    });
    for (const item of findClasses) {
      result.push(item);
    }
    return result;
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
  ): Promise<{ data: Classroom[]; meta: PaginationMeta }> {
    const findTutor = await this.studentRepository.findOne({
      where: { userId: userId },
    });
    let abc = findTutor.classes;
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
    const findUser = await this.tutorRepository.findOne({
      where: { userId: userId },
    });
    const findClass = await this.classroomRepository.findOne({
      where: { classId: classId },
    });

    findUser.classList = findUser.classList.filter(
      (classId) => classId !== classId,
    );
    findClass.studentList = findClass.studentList.filter(
      (student) => student !== userId,
    );
    if (findUser.classrooms) {
      findUser.classrooms = findUser.classrooms.filter(
        (classe) => classe.classId !== classId,
      );
    }
    if (findClass.students) {
      findClass.students = findClass.students.filter(
        (student) => student.userId !== userId,
      );
    }
    await this.studentRepository.save(findUser);
    await this.classroomRepository.save(findClass);
    return 'Student successfully unregistered from the class';
  }
}
