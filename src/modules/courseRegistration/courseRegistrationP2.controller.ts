import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { CourseRegistrationP2Service } from './courseRegistrationP2.service';
import { Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from '@common/decorator';
import { Classroom } from '@modules/class/entity/class.entity';
import { ResponseViewApiP2 } from './dto';
import { PaginationMeta } from './courseRegistration.service';

@ApiAuthController('phase2_register')
export class Phase2RegisterController {
  constructor(
    private readonly registerP2Service: CourseRegistrationP2Service,
  ) {}

  @Get('register-class/:classId')
  @ApiResponseString()
  async registerStudentP2(
    @CurrentUser() user: any,
    @Param('classId') classId: string,
  ): Promise<string> {
    return this.registerP2Service.registerClassStudent(user.userId, classId);
  }

  @Get('unregister-class/:classId')
  @ApiResponseString()
  async unregisterStudentP2(
    @CurrentUser() user: any,
    @Param('classId') classId: string,
  ): Promise<string> {
    return this.registerP2Service.unregisterClassStudent(user.userId, classId);
  }

  @Get('view-registered-classes-student')
  @ApiResponseArray(Classroom)
  async viewRegisteredClassesStudent(
    @CurrentUser() user: any,
  ): Promise<Classroom[]> {
    return this.registerP2Service.viewRegisteredClassesStudent(user.userId);
  }

  @Get('view-registered-classes-tutor')
  @ApiResponseArray(Classroom)
  async viewRegisteredClassesTutor(
    @CurrentUser() user: any,
  ): Promise<Classroom[]> {
    return this.registerP2Service.viewRegisteredClassesTutor(user.userId);
  }

  @Get('view-unregistered-classes-student')
  @ApiResponseObject(ResponseViewApiP2)
  async viewUnregisteredCourseP2tudent(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('q') q: string,
  ): Promise<{
    data: Classroom[];
    meta: PaginationMeta;
  }> {
    return this.registerP2Service.viewUnregisteredClassesStudent(
      user.userId,
      page,
      limit,
      q,
    );
  }

  @Get('view-unregistered-classes-tutor')
  @ApiResponseObject(ResponseViewApiP2)
  async viewUnregisteredCourseP2Tutor(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('q') q: string,
  ): Promise<{
    data: Classroom[];
    meta: PaginationMeta;
  }> {
    return this.registerP2Service.viewUnregisteredClassesTutor(
      user.userId,
      page,
      limit,
      q,
    );
  }
}
