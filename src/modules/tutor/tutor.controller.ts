import { ApiAuthController, ApiResponseObject } from '@services/openApi';
import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '@common/decorator';
import { TutorService } from './tutor.service';
import { CreateTutorDTO } from './dto/createTutor.dto';
import { Tutor } from './entity/tutor.entity';
import { UpdateTutorDTO } from './dto/updateTutor.dto';

@ApiAuthController('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('/create')
  @ApiResponseObject(Tutor)
  async createTutor(@Body() body: CreateTutorDTO): Promise<Tutor> {
    return this.tutorService.createTutor(body);
  }

  @Post('/update')
  @ApiResponseObject(Tutor)
  async updateTutorInfo(
    @CurrentUser() student: Tutor,
    @Body() data: UpdateTutorDTO,
  ): Promise<Tutor> {
    console.log(student);
    return this.tutorService.editTutorInfo(student.userId, data);
  }
}
