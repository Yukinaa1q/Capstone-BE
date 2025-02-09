import { PartialType } from '@nestjs/swagger';
import { CreateCourseDTO } from './createCourse.dto';

export class UpdateCourseDTO extends PartialType(CreateCourseDTO) {}
