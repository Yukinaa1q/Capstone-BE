import { ApiAuthController, ApiResponseObject } from '@services/openApi';
import { StudentService } from './student.service';
import { Body, Post } from '@nestjs/common';
import { Student } from './entity';
import { CreateStudentDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateStudentDTO } from './dto/updateStudent.dto';

@ApiAuthController('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('/create')
  @ApiResponseObject(Student)
  async createStudent(@Body() body: CreateStudentDTO): Promise<Student> {
    return this.studentService.createStudent(body);
  }

  @Post('/update')
  @ApiResponseObject(Student)
  async updateStudentInfo(
    @CurrentUser() student: Student,
    @Body() data: UpdateStudentDTO,
  ): Promise<Student> {
    console.log(student);
    return this.studentService.editStudentInfo(student.userId, data);
  }
}
