import { PartialType } from '@nestjs/swagger';
import { CreateClassroomDTO } from './createClassroom.dto';

export class UpdateClassroomDTO extends PartialType(CreateClassroomDTO) {}
