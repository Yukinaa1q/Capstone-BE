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
import { StaffService } from '@modules/staff';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly studentService: StudentService,
    private readonly tutorService: TutorService,
    private readonly staffService: StaffService,
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
    const [checkDup, checkDupPhone] = await Promise.all([
      this.studentService.findOneStudent(data.email),
      this.studentService.findOneStudentByPhone(data.phone),
    ]);
    if (checkDupPhone) {
      throw new ServiceException(
        ResponseCode.PHONE_EXIST,
        'This phone is registered',
        400,
      );
    }
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.SAME_EMAIL_ERROR,
        'This email is registered',
        400,
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
    const [checkDup, checkDupPhone] = await Promise.all([
      this.tutorService.findOneTutor(data.email),
      this.tutorService.findOneTutorByPhone(data.phone),
    ]);
    if (checkDupPhone) {
      throw new ServiceException(
        ResponseCode.PHONE_EXIST,
        'This phone is registered',
        400,
      );
    }
    if (checkDup) {
      throw new ServiceException(
        ResponseCode.SAME_EMAIL_ERROR,
        'This email is registered',
        400,
      );
    }
    const newUser = await this.tutorService.createTutor(data);
    return 'Your account is successfully created';
  }

  async logInWithPasswordStaff(data: LogInWithPasswordDTO): Promise<String> {
    const user = await this.staffService.findOneStaff(data.email);
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
      role: user.role,
      userId: user.userId,
      userCode: user.staffCode,
      name: user.name,
    } as UserPayload;

    const accessToken = await this.jwtService.signAsync(
      { payload },
      { secret: JWT_SECRET },
    );
    return accessToken;
  }

  // async logInWithPasswordAdmin(data: LogInWithPasswordDTO): Promise<String> {
  //   const user = await this.adminRepository.findOne({
  //     where: { email: data.email },
  //   });
  //   if (!user) {
  //     throw new ServiceException(
  //       ResponseCode.USER_NOT_FOUND,
  //       'Not found user in db',
  //     );
  //   }
  //   const checkPass = await checkPassword(data.password, user.password);
  //   if (!checkPass) {
  //     throw new ServiceException(
  //       ResponseCode.WRONG_PASSWORD,
  //       'Wrong credentials',
  //     );
  //   }

  //   const payload = {
  //     role: 'admin',
  //     userId: user.userId,
  //     userCode: user.adminCode,
  //     name: user.name,
  //   } as UserPayload;

  //   const accessToken = await this.jwtService.signAsync(
  //     { payload },
  //     { secret: JWT_SECRET },
  //   );
  //   return accessToken;
  // }
}
