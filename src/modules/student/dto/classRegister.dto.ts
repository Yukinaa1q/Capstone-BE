import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ClassRegisterDTO {
  @ApiProperty({ description: 'UUID of the class to register for' })
  @IsNotEmpty()
  @IsUUID()
  classId: string;
}
