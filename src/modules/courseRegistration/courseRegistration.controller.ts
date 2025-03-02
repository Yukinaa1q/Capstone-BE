import { ApiAuthController, ApiResponseString } from '@services/openApi';
import { CourseRegistrationService } from './courseRegistration.service';
import { Body, Delete, Get, Post } from '@nestjs/common';
import {
  InputStudentP1RegDTO,
  InputTutorP1RegDTO,
  UnregisterStudentP1,
  UnregisterTutorP1,
} from './dto';

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
