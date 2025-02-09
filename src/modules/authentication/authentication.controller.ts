import { ApiController, ApiResponseString } from '@services/openApi';
import { AuthenticationService } from './authentication.service';
import { Body, Post } from '@nestjs/common';
import { LogInWithPasswordDTO } from './dto';
import { CreateStudentDTO } from '@modules/student/dto';

@ApiController('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @ApiResponseString()
  async logIn(@Body() data: LogInWithPasswordDTO) {
    const token = await this.authenticationService.logInWithPassword(data);
    return token;
  }

  @Post('signup')
  @ApiResponseString()
  async signup(@Body() data: CreateStudentDTO) {
    const signup = await this.authenticationService.registerNative(data);
    return signup;
  }
}
