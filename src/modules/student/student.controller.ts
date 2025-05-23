import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { StudentService } from './student.service';
import { Body, Get, Param, Post, Query, Delete } from '@nestjs/common';
import { CreateStudentDTO } from './dto';
import { CurrentUser } from '@common/decorator';
import { UpdateStudentDTO } from './dto/updateStudent.dto';
import { Student } from './entity/student.entity';
import { StudentListViewDTO } from './dto/studentListView.dto';
import { StudentDetailDTO } from './dto/studentDetails.dto';
import { ClassRegisterDTO } from './dto/classRegister.dto';
import { UpdateStudentProfileDTO } from './dto/updateStudentProfile.dto';

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

  @Post('/update-student-profile/:studentId')
  @ApiResponseObject(Student)
  async updateStudentProfile(
    @Param('studentId') studentId: string,
    @Body() data: UpdateStudentProfileDTO,
  ): Promise<Student> {
    return this.studentService.updateStudentProfile(studentId, data);
  }

  @Get('/view-registered-class')
  async viewRegisteredClasses(
    @CurrentUser() user: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('q') q: string,
  ) {
    return this.viewRegisteredClasses(user.userId, page, limit, q);
  }

  @Get('/view-registered-classes-simple')
  async viewRegisteredClassesSimple(@CurrentUser() user: any) {
    return this.studentService.viewRegisteredClassesSimple(user.userId);
  }

  @Post('/class-payment')
  @ApiResponseString()
  async classPayment(
    @CurrentUser() user: any,
    @Body() data: { classPaid: string[] },
  ): Promise<string> {
    return this.studentService.classPayment(user.userId, data.classPaid);
  }

  @Get('/filter-class-payment')
  async filterClassPayment(@CurrentUser() user: any) {
    return this.studentService.filterClassPayment(user.userId);
  }

  @Get('/view-student-class-history/:studentId')
  async viewClassHistory(@Param('studentId') studentId: string) {
    return this.studentService.viewStudentClassHistory(studentId);
  }

  // @Delete('/unregister-class/:classId')
  // @ApiResponseObject(String)
  // async unregisterStudentFromClass(
  //   @CurrentUser() student: any,
  //   @Param('classId') classId: string,
  // ): Promise<string> {
  //   return this.studentService.unregisterStudentFromClass(
  //     student.userId,
  //     classId,
  //   );
  // }
}
