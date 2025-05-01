import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GradeService } from './grade.service';
import { UpdateGradeDTO } from './dto/updateGrade.dto';
import { ApiAuthController } from '@services/openApi';

@ApiAuthController('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('class/:classId')
  async viewStudentGradeInClass(@Param('classId') classId: string) {
    return this.gradeService.viewStudentGradeInClass(classId);
  }

  @Post('update')
  async updateGrade(@Body() updateGradeDto: UpdateGradeDTO[]) {
    return this.gradeService.updateGrade(updateGradeDto);
  }

  @Get('search')
  async searchStudentForGrade(@Query('search') search?: string) {
    return this.gradeService.searchStudentForGrade(search);
  }

  @Get('student/:studentId')
  async viewScoreStudent(@Param('studentId') studentId: string) {
    return this.gradeService.viewScoreStudent(studentId);
  }
}
