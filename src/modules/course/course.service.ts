import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entity';
import { Repository } from 'typeorm';
import { CreateCourseDTO } from './dto';
import { ResponseCode, ServiceException } from '@common/error';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { CloudinaryService } from '@services/cloudinary/cloudinary.service';

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
    const checkDup = await this.findOneCourse(data.pId);
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.DUPLICATE_COURSE,
        'Duplicate Course',
      );
    }
    const imageUrl = await this.cloudinaryService.uploadImage(file);

    const newCourse = await this.courseRepository.create({
      image: imageUrl,
      ...data,
    });
    if (typeof newCourse.courseContent === 'string') {
      newCourse.courseContent = JSON.parse(newCourse.courseContent);
    }
    await this.courseRepository.save(newCourse);

    return newCourse;
  }

  async updateCourse(courseId: string, data: UpdateCourseDTO): Promise<Course> {
    await this.courseRepository.update(courseId, data);
    const updateCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    if (typeof updateCourse.courseContent === 'string') {
      updateCourse.courseContent = JSON.parse(updateCourse.courseContent);
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
    await this.cloudinaryService.deleteImage(findCourse.image);
    await this.courseRepository.update(courseId, { image: newImageUrl });
    return 'Your image was changed successfully';
  }

  async deleteCourse(courseId: string): Promise<string> {
    const findCourse = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    await this.cloudinaryService.deleteImage(findCourse.image);
    const deleteCourse = await this.courseRepository.delete(courseId);

    return 'The course is successfully deleted';
  }

  async findAllCourse(): Promise<Course[]> {
    const allCourse = await this.courseRepository.find();
    return allCourse;
  }

  async findOneCourse(pId: string): Promise<Course> {
    const findCourse = await this.courseRepository.findOne({
      where: { pId: pId },
    });
    return findCourse;
  }
}
