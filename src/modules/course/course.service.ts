import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ResponseCode, ServiceException } from '@common/error';
import { CourseCodeAndTitleDTO, UpdateCourseDTO } from './dto/updateCourse.dto';
import { CloudinaryService } from '@services/cloudinary/cloudinary.service';
import { Course } from './entity/course.entity';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { ViewAllCourseDTO } from './dto/viewAllCourse.dto';
import { Classroom } from '@modules/class/entity/class.entity';
import { generateCustomID } from '@utils';
import { CourseSubject } from './course.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Classroom)
    private readonly classRepository: Repository<Classroom>,
  ) {}
  async generateCoursesCode(subject: string): Promise<string> {
    const lastCourse = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.courseSubject = :subject', { subject })
      .orderBy('course.courseCode', 'DESC')
      .getOne();
    const lastNumber = lastCourse
      ? parseInt(lastCourse.courseCode.slice(2))
      : 0;
    const subjectPrefix = CourseSubject[subject as keyof typeof CourseSubject];
    return generateCustomID(subjectPrefix, lastNumber + 1);
  }
  async createCourse(
    file: Express.Multer.File,
    file2: Express.Multer.File,
    data: CreateCourseDTO,
  ): Promise<Course> {
    const courseCode = await this.generateCoursesCode(data.courseSubject);

    const imageUrl = await this.cloudinaryService.uploadImage(file);

    const courseOutline = await this.cloudinaryService.uploadPDF(file2);

    const newCourse = await this.courseRepository.create({
      courseImage: imageUrl,
      courseOutline: courseOutline,
      courseCode: courseCode,
      ...data,
    });

    await this.courseRepository.save(newCourse);

    return newCourse;
  }

  async updateCourse(courseId: string, data: UpdateCourseDTO): Promise<Course> {
    await this.courseRepository.update(courseId, data);
    const updateCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });

    return updateCourse;
  }

  async updateImage(
    courseId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    const newImageUrl = await this.cloudinaryService.uploadImage(file);
    await this.cloudinaryService.deleteImage(findCourse.courseImage);
    await this.courseRepository.update(courseId, { courseImage: newImageUrl });
    return 'Your courseImage was changed successfully';
  }

  async updateCourseOutline(
    courseId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    const newCourseOutlineUrl = await this.cloudinaryService.uploadPDF(file);

    await this.cloudinaryService.deletePDF(findCourse.courseOutline);
    await this.courseRepository.update(courseId, {
      courseOutline: newCourseOutlineUrl,
    });
    return 'Your courseOutline was changed successfully';
  }

  async deleteCourse(courseId: string): Promise<string> {
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    await this.cloudinaryService.deleteImage(findCourse.courseImage);
    if (findCourse.courseOutline !== 'none')
      await this.cloudinaryService.deletePDF(findCourse.courseOutline);
    const deleteCourse = await this.courseRepository.delete(courseId);

    return 'The course is successfully deleted';
  }

  async findAllCourse(): Promise<ViewAllCourseDTO[]> {
    const allCourse = await this.courseRepository.find();
    const result: ViewAllCourseDTO[] = [];
    for (const course of allCourse) {
      const [findClassInCourse, classNumber] =
        await this.classRepository.findAndCount({
          where: {
            classId: In(course.classes),
            status: 'open',
          },
        });
      let totalStudentNumber = 0;
      for (const item of findClassInCourse) {
        totalStudentNumber = totalStudentNumber + item.currentStudents;
      }
      result.push({
        ...course,
        totalClassNumber: classNumber,
        totalStudentNumber,
      });
    }
    return result;
  }

  async findOneCourse(pId: string): Promise<Course> {
    const findCourse = await this.courseRepository.findOne({
      where: { courseCode: pId },
    });
    return findCourse;
  }

  async getAllCourseCodeAndTitle(): Promise<CourseCodeAndTitleDTO[]> {
    const findAllCourse = await this.courseRepository.find();
    const result = [];
    let i = 0;
    findAllCourse.forEach((course) => {
      result[i] = {} as CourseCodeAndTitleDTO;
      result[i].courseCode = course.courseCode;
      result[i].courseTitle = course.courseTitle;
      result[i].courseLevel = course.courseLevel;
      result[i].courseSubject = course.courseSubject;
      i++;
    });
    return result;
  }
}
