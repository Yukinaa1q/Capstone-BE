import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import {
  CourseRegistrationService,
  PaginationMeta,
} from './courseRegistration.service';
import { Body, Delete, Get, Param, Post, Query } from '@nestjs/common';
import {
  CourseRegP1DTO,
  CourseUnRegP1DTO,
  InputStudentP1RegDTO,
  InputTutorP1RegDTO,
  ResponseViewApi,
  UnregisterStudentP1,
  UnregisterTutorP1,
} from './dto';
import { CurrentUser } from '@common/decorator';

@ApiAuthController('phase1_register')
export class Phase1RegisterController {
  constructor(
    private readonly registrationService: CourseRegistrationService,
  ) {}

  @Post('student')
  @ApiResponseString()
  async registerStudentP1(@Body() data: InputStudentP1RegDTO): Promise<String> {
    return this.registrationService.studentPreRegP1(data);
  }

  @Post('tutor')
  @ApiResponseString()
  async registerTutorP1(@Body() data: InputTutorP1RegDTO): Promise<String> {
    return this.registrationService.tutorPreRegP1(data);
  }

  @Get('registered-course-p1')
  @ApiResponseObject(ResponseViewApi)
  async viewRegisteredCourseP1(
    @CurrentUser() user: any,
  ): Promise<CourseRegP1DTO[]> {
    return this.registrationService.viewRegisteredStudentP1(
      user.userId,
      user.role,
    );
  }

  @Get('random-5-courses/:id')
  @ApiResponseArray(CourseUnRegP1DTO)
  async viewRandomUnregisteredCourse(
    @Param('id') id: string,
  ): Promise<CourseUnRegP1DTO[]> {
    return this.registrationService.viewUnregisteredRandomP1(id);
  }

  @Get('unregister-course-p1')
  @ApiResponseObject(ResponseViewApi)
  async viewUnregisteredCourseP1(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    data: CourseUnRegP1DTO[];
    meta: PaginationMeta;
  }> {
    return this.registrationService.viewUnregisteredP1(
      user.userId,
      user.role,
      page,
      limit,
    );
  }

  @Get('unregister-course-p1-tutor')
  @ApiResponseObject(ResponseViewApi)
  async viewUnregisteredCourseP1Tutor(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    data: CourseUnRegP1DTO[];
    meta: PaginationMeta;
  }> {
    return this.registrationService.viewUnregisteredP1(
      user.userId,
      user.role,
      page,
      limit,
    );
  }

  @Delete('student')
  @ApiResponseString()
  async unregisterStudentP1(
    @Body() data: UnregisterStudentP1,
  ): Promise<String> {
    return this.registrationService.unregisterStudentP1(data);
  }

  @Delete('tutor')
  @ApiResponseString()
  async unregisterTutorP1(@Body() data: UnregisterTutorP1): Promise<String> {
    return this.registrationService.unregisterTutorP1(data);
  }
}
