import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { ClassroomService } from './class.service';
import { Body, Delete, Param, Post } from '@nestjs/common';
import { CreateClassroomDTO } from './dto/createClassroom.dto';
import { UpdateClassroomDTO } from './dto/updateClassroom.dto';
import { ViewAllClassroomDTO } from './dto/viewAllClassroom.dto';
import { ViewClassDetailDTO } from './dto/viewClassDetail.dto';
import { Classroom } from './entity/class.entity';

@ApiAuthController('class')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post('create-class')
  @ApiResponseObject(Classroom)
  async createClass(@Body() data: CreateClassroomDTO): Promise<Classroom> {
    return this.classroomService.createClass(data);
  }

  @Post('update-class/:id')
  @ApiResponseObject(Classroom)
  async updateClass(
    @Body() data: UpdateClassroomDTO,
    @Param('id') id: string,
  ): Promise<Classroom> {
    return this.classroomService.updateClass(id, data);
  }

  @Post('view-class')
  @ApiResponseArray(ViewAllClassroomDTO)
  async viewAllClasses(
    @Body() courseCode: string,
  ): Promise<ViewAllClassroomDTO[]> {
    return this.classroomService.viewClasses(courseCode);
  }

  @Post('view-class-detail/:id')
  @ApiResponseObject(ViewClassDetailDTO)
  async viewClassDetail(@Body() classId: string): Promise<ViewClassDetailDTO> {
    return this.classroomService.viewClassDetail(classId);
  }

  @Delete('delete-class/:id')
  @ApiResponseString()
  async deleteClass(@Body() classId: string): Promise<string> {
    return this.classroomService.deleteClass(classId);
  }
}
