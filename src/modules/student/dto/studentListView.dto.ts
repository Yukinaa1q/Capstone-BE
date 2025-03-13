import { OmitUpdateType } from '@services/openApi';
import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Student } from '../entity/student.entity';

export class StudentListViewDTO extends OmitUpdateType(Student, [
  'userId',
  'name',
  'email',
  'studentCode',
]) {
  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  studentCode: string;

  @ApiProperty()
  studentEmail: string;

  constructor(student: Student) {
    super();
    this.studentName = student.name;
    this.studentId = student.userId;
    this.studentCode = student.studentCode;
    this.studentEmail = student.email;
  }
}
