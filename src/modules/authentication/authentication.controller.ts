import {
  ApiController,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { AuthenticationService } from './authentication.service';
import { Body, Post } from '@nestjs/common';
import { AccessTokenDTO, LogInWithPasswordDTO } from './dto';
import { CreateStudentDTO } from '@modules/student/dto';
import { CreateTutorDTO } from '@modules/tutor/dto/createTutor.dto';

@ApiController('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @ApiResponseObject(AccessTokenDTO)
  async logIn(@Body() data: LogInWithPasswordDTO) {
    const token = await this.authenticationService.logInWithPassword(data);
    return { token: token };
  }

  @Post('signup')
  @ApiResponseString()
  async signup(@Body() data: CreateStudentDTO) {
    const signup = await this.authenticationService.registerNative(data);
    return signup;
  }

  @Post('login/tutor')
  @ApiResponseObject(AccessTokenDTO)
  async logInTutor(@Body() data: LogInWithPasswordDTO) {
    const token = await this.authenticationService.logInWithPasswordTutor(data);
    return { token: token };
  }

  @Post('signup/tutor')
  @ApiResponseString()
  async signupTutor(@Body() data: CreateTutorDTO) {
    const signup = await this.authenticationService.registerNativeTutor(data);
    return signup;
  }

  @Post('login/staff')
  @ApiResponseString()
  async logInStaff(@Body() data: LogInWithPasswordDTO) {
    const token = await this.authenticationService.logInWithPasswordStaff(data);
    return { token: token };
  }
}
