import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { CourseService } from './course.service';
import {
  Body,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { FileUploadDto } from './dto/fileUpload.dto';
import { UpdateCourseDTO, CourseCodeAndTitleDTO } from './dto/updateCourse.dto';
import { Course } from './entity/course.entity';
import { ViewAllCourseDTO } from './dto/viewAllCourse.dto';

@ApiAuthController('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('create-course')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'courseImage', maxCount: 1 },
      { name: 'courseOutline', maxCount: 1 },
    ]),
  )
  @ApiBody({
    description: 'Avatar file to be uploaded',
    schema: {
      type: 'object',
      properties: {
        courseImage: { type: 'string', format: 'binary' },
        courseSubject: { type: 'string' },
        courseName: { type: 'string' },
        courseLevel: { type: 'string' },
        coursePrice: { type: 'number' },
        courseCode: { type: 'string' },
        participantNumber: { type: 'number', default: 0 },
        courseDescription: { type: 'string' },
        courseOutline: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponseObject(Course)
  async createCourse(
    @UploadedFiles()
    files: {
      courseImage: Express.Multer.File[];
      courseOutline: Express.Multer.File[];
    },
    @Body() data: CreateCourseDTO,
  ) {
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 }), // 15MB
      ],
    }).transform(files.courseImage?.[0]);

    if (files.courseOutline?.[0]) {
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 }), // 15MB
        ],
      }).transform(files.courseOutline[0]);
    }
    return this.courseService.createCourse(
      files.courseImage?.[0],
      files.courseOutline?.[0],
      data,
    );
  }

  @Post('update-course/:id')
  @ApiResponseObject(Course)
  async updateCourse(
    @Body() data: UpdateCourseDTO,
    @Param('id') id: string,
  ): Promise<Course> {
    return this.courseService.updateCourse(id, data);
  }

  @Post('update-course-image/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Modal file to be uploaded',
    type: FileUploadDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponseString()
  async updateImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 })],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.courseService.updateImage(id, file);
  }

  @Post('update-course-outline/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Modal file to be uploaded',
    type: FileUploadDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponseString()
  async updateOutline(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 })],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.courseService.updateCourseOutline(id, file);
  }

  @Get('all-course')
  @ApiResponseArray(ViewAllCourseDTO)
  async getAllCourse(): Promise<ViewAllCourseDTO[]> {
    return this.courseService.findAllCourse();
  }

  @Get('/course-code-title')
  @ApiResponseArray(CourseCodeAndTitleDTO)
  async getAllCodeAndTitle(): Promise<CourseCodeAndTitleDTO[]> {
    return this.courseService.getAllCourseCodeAndTitle();
  }

  @Get(':id')
  @ApiResponseObject(Course)
  async getOneCourse(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOneCourse(id);
  }

  @Delete('delete/:id')
  @ApiResponseString()
  async deleteCourse(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }
}
