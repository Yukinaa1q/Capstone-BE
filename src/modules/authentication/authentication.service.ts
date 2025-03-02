import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LogInWithPasswordDTO } from './dto/logInWithPass.dto';
import { StudentService } from '@modules/student';
import { ResponseCode, ServiceException } from '@common/error';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '@environment';
import { checkPassword } from '@utils';
import { CreateStudentDTO } from '@modules/student/dto';
import { TutorService } from '@modules/tutor/tutor.service';
import { CreateTutorDTO } from '@modules/tutor/dto/createTutor.dto';
import { UserPayload } from './dto';
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly studentService: StudentService,
    private readonly tutorService: TutorService,
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
      throw new ServiceException(
        ResponseCode.WRONG_PASSWORD,
        'Wrong credentials',
      );
    }
    const payload = {
      role: 'student',
      userId: user.userId,
      userCode: user.studentCode,
      name: user.name,
    } as UserPayload;

    const accessToken = await this.jwtService.signAsync(
      { payload },
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

  async logInWithPasswordTutor(data: LogInWithPasswordDTO): Promise<String> {
    const user = await this.tutorService.findOneTutor(data.email);
    if (!user) {
      throw new ServiceException(
        ResponseCode.USER_NOT_FOUND,
        'Not found user in db',
      );
    }
    const checkPass = await checkPassword(data.password, user.password);
    if (!checkPass) {
      throw new ServiceException(
        ResponseCode.WRONG_PASSWORD,
        'Wrong credentials',
      );
    }

    const payload = {
      role: 'tutor',
      userId: user.userId,
      userCode: user.tutorCode,
      name: user.name,
    } as UserPayload;

    const accessToken = await this.jwtService.signAsync(
      { payload },
      { secret: JWT_SECRET },
    );
    return accessToken;
  }

  async registerNativeTutor(data: CreateTutorDTO): Promise<String> {
    const checkDup = await this.tutorService.findOneTutor(data.email);
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.SAME_EMAIL_ERROR,
        'This email is registered',
      );
    }
    const newUser = await this.tutorService.createTutor(data);
    return 'Your account is successfully created';
  }
}
