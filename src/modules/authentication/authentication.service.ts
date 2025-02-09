import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LogInWithPasswordDTO } from './dto/logInWithPass.dto';
import { StudentService } from '@modules/student';
import { ResponseCode, ServiceException } from '@common/error';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '@environment';
import { checkPassword } from '@utils';
import { CreateStudentDTO } from '@modules/student/dto';
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly studentService: StudentService,
    private jwtService: JwtService,
  ) {}

  async logInWithPassword(data: LogInWithPasswordDTO): Promise<String> {
    const user = await this.studentService.findOneStudent(data.email);
    if (!user) {
      throw new ServiceException(
        ResponseCode.USER_NOT_FOUND,
        'Not found user in db',
      );
    }
    const checkPass = await checkPassword(data.password, user.password);
    if (!checkPass) {
      throw new ServiceException(ResponseCode.WRONG_PASSWORD, 'Wrong password');
    }

    const accessToken = await this.jwtService.signAsync(
      { user },
      { secret: JWT_SECRET },
    );
    return accessToken;
  }

  async registerNative(data: CreateStudentDTO): Promise<String> {
    const checkDup = await this.studentService.findOneStudent(data.email);
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.SAME_EMAIL_ERROR,
        'This email is registered',
      );
    }
    const newUser = await this.studentService.createStudent(data);
    return 'Your account is successfully created';
  }
}
