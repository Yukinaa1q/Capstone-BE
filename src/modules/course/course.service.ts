import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseCode, ServiceException } from '@common/error';
import { CourseCodeAndTitleDTO, UpdateCourseDTO } from './dto/updateCourse.dto';
import { CloudinaryService } from '@services/cloudinary/cloudinary.service';
import { Course } from './entity/course.entity';
import { CreateCourseDTO } from './dto/createCourse.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createCourse(
    file: Express.Multer.File,
    data: CreateCourseDTO,
  ): Promise<Course> {
    const checkDup = await this.findOneCourse(data.courseCode);
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.DUPLICATE_COURSE,
        'Duplicate Course',
      );
    }
    const imageUrl = await this.cloudinaryService.uploadImage(file);

    const newCourse = await this.courseRepository.create({
      courseImage: imageUrl,
      ...data,
    });
    if (typeof newCourse.courseOutline === 'string') {
      newCourse.courseOutline = JSON.parse(newCourse.courseOutline);
    }
    await this.courseRepository.save(newCourse);

    return newCourse;
  }

  async updateCourse(courseId: string, data: UpdateCourseDTO): Promise<Course> {
    await this.courseRepository.update(courseId, data);
    const updateCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    if (typeof updateCourse.courseOutline === 'string') {
      updateCourse.courseOutline = JSON.parse(updateCourse.courseOutline);
    }
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

  async deleteCourse(courseId: string): Promise<string> {
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    await this.cloudinaryService.deleteImage(findCourse.courseImage);
    const deleteCourse = await this.courseRepository.delete(courseId);

    return 'The course is successfully deleted';
  }

  async findAllCourse(): Promise<Course[]> {
    const allCourse = await this.courseRepository.find();
    return allCourse;
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
      i++;
    });
    return result;
  }
}
