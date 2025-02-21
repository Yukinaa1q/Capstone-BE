import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCourseDTO } from './createCourse.dto';
import { IsString } from 'class-validator';

export class UpdateCourseDTO extends PartialType(CreateCourseDTO) {}

export class CourseCodeAndTitleDTO {
  @ApiProperty()
  @IsString()
  courseCode: string;

  @ApiProperty()
  @IsString()
  courseTitle: string;
}
