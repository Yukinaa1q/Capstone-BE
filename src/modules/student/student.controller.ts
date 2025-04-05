import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { StudentService } from './student.service';
import { Body, Get, Param, Post } from '@nestjs/common';
import { CreateStudentDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateStudentDTO } from './dto/updateStudent.dto';
import { Student } from './entity/student.entity';
import { StudentListViewDTO } from './dto/studentListView.dto';
import { StudentDetailDTO } from './dto/studentDetails.dto';
import { ClassRegisterDTO } from './dto/classRegister.dto';

@ApiAuthController('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('/create')
  @ApiResponseObject(Student)
  async createStudent(@Body() body: CreateStudentDTO): Promise<Student> {
    return this.studentService.createStudent(body);
  }

  @Get('all-student')
  @ApiResponseArray(Student)
  async getAllStudent(): Promise<Student[]> {
    return this.studentService.getAllStudent();
  }

  @Get('all-student-table')
  @ApiResponseArray(StudentListViewDTO)
  async getAllStudentForTable(): Promise<StudentListViewDTO[]> {
    return this.studentService.getAllStudentForTable();
  }

  @Get('/detail/:userId')
  @ApiResponseObject(StudentDetailDTO)
  async getStudentDetail(
    @Param('userId') userId: string,
  ): Promise<StudentDetailDTO> {
    return this.studentService.getStudentDetail(userId);
  }

  @Post('/update')
  @ApiResponseObject(Student)
  async updateStudentInfo(
    @CurrentUser() student: any,
    @Body() data: UpdateStudentDTO,
  ): Promise<Student> {
    return this.studentService.editStudentInfo(student.userId, data);
  }

  @Post('/register-class')
  @ApiResponseString()
  async registerForClass(
    @CurrentUser() student: any,
    @Body() data: ClassRegisterDTO,
  ): Promise<string> {
    return this.studentService.registerForClass(student.userId, data.classId);
  }
}
