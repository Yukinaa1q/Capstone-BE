import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
} from '@services/openApi';
import { Body, Get, Param, Post } from '@nestjs/common';

import { CurrentUser } from '@common/decorator';
import { TutorService } from './tutor.service';
import { CreateTutorDTO } from './dto/createTutor.dto';
import { Tutor } from './entity/tutor.entity';
import { UpdateTutorDTO, UpdateTutorProfileDTO } from './dto/updateTutor.dto';
import { TutorListViewDTO } from './dto/tutorListview.dto';
import { TutorDetailDTO } from './dto/tutorDetails.dto';

@ApiAuthController('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('/create')
  @ApiResponseObject(Tutor)
  async createTutor(@Body() body: CreateTutorDTO): Promise<Tutor> {
    return this.tutorService.createTutor(body);
  }

  @Get('all-tutor')
  @ApiResponseArray(Tutor)
  async getAllTutor(): Promise<Tutor[]> {
    return this.tutorService.getAllTutor();
  }

  @Get('all-tutor-table')
  @ApiResponseArray(TutorListViewDTO)
  async getAllTutorForTable(): Promise<TutorListViewDTO[]> {
    return this.tutorService.getAllTutorForTable();
  }

  @Get('/detail/:userId')
  @ApiResponseObject(TutorDetailDTO)
  async getStudentDetail(
    @Param('userId') userId: string,
  ): Promise<TutorDetailDTO> {
    return this.tutorService.getTutorDetail(userId);
  }

  @Post('/update')
  @ApiResponseObject(Tutor)
  async updateTutorInfo(
    @CurrentUser() student: Tutor,
    @Body() data: UpdateTutorDTO,
  ): Promise<Tutor> {
    return this.tutorService.editTutorInfo(student.userId, data);
  }

  @Post('/update-tutor-profile/:tutorId')
  @ApiResponseObject(Tutor)
  async updateTutorProfile(
    @Param('tutorId') tutorId: string,
    @Body() data: UpdateTutorProfileDTO,
  ): Promise<Tutor> {
    return this.tutorService.updateTutorProfile(tutorId, data);
  }

  @Get('/view-registered-classes')
  async viewRegisteredClasses(@CurrentUser() user: any) {
    return this.tutorService.viewRegisteredClasses(user.userId);
  }
}
