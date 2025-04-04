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
  NewTutorRegDTO,
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
    @CurrentUser() user: any,
  ): Promise<CourseUnRegP1DTO[]> {
    return this.registrationService.viewUnregisteredRandomP1(
      user.userId,
      user.role,
    );
  }

  @Get('unregister-course-p1')
  @ApiResponseObject(ResponseViewApi)
  async viewUnregisteredCourseP1(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('q') q: string,
  ): Promise<{
    data: CourseUnRegP1DTO[];
    meta: PaginationMeta;
  }> {
    return this.registrationService.viewUnregisteredP1(
      user.userId,
      user.role,
      page,
      limit,
      q,
    );
  }

  @Get('unregister-course-p1-tutor')
  @ApiResponseObject(ResponseViewApi)
  async viewUnregisteredCourseP1Tutor(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('q') q: string,
  ): Promise<{
    data: CourseUnRegP1DTO[];
    meta: PaginationMeta;
  }> {
    return this.registrationService.viewUnregisteredP1(
      user.userId,
      user.role,
      page,
      limit,
      q,
    );
  }

  @Post('new-tutor-register-class')
  @ApiResponseString()
  async newRegisterClassTutor(
    @CurrentUser() user: any,
    @Body() data: NewTutorRegDTO,
  ): Promise<string> {
    return this.registrationService.newTutorReg(user.userId, data);
  }

  @Delete('student/delete')
  @ApiResponseString()
  async unregisterStudentP1(
    @Body() data: UnregisterStudentP1,
  ): Promise<string> {
    return this.registrationService.unregisterStudentP1(data);
  }

  @Delete('tutor/delete')
  @ApiResponseString()
  async unregisterTutorP1(@Body() data: UnregisterTutorP1): Promise<String> {
    return this.registrationService.unregisterTutorP1(data);
  }
}
