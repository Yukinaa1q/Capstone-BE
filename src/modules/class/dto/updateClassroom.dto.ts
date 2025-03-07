import { PartialType } from '@nestjs/swagger';
import { CreateClassroomDTO } from './createClassroom.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Student } from '@modules/student/entity/student.entity';

export class UpdateClassroomDTO extends PartialType(CreateClassroomDTO) {
  @IsArray()
  @IsOptional()
  students?: Student[];
}
