import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
  ApiResponseString,
} from '@services/openApi';
import { ClassroomService } from './class.service';
import { Body, Delete, Get, Param, Post } from '@nestjs/common';
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
  async createClass(
    @Body() data: CreateClassroomDTO,
  ): Promise<Classroom | string> {
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

  @Get('view-class')
  @ApiResponseArray(ViewAllClassroomDTO)
  async viewAllClasses(): Promise<ViewAllClassroomDTO[]> {
    return this.classroomService.viewClasses();
  }

  @Get('view-class-detail/:id')
  @ApiResponseObject(ViewClassDetailDTO)
  async viewClassDetail(@Param('id') id: string): Promise<ViewClassDetailDTO> {
    return this.classroomService.viewClassDetail(id);
  }

  @Delete('delete-class/:id')
  @ApiResponseString()
  async deleteClass(@Param('id') id: string): Promise<string> {
    return this.classroomService.deleteClass(id);
  }
}
