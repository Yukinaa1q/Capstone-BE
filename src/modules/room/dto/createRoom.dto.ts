import { OmitUpdateType } from '@services/openApi';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Room } from '@modules/courseRegistration/entity/room.entity';

export class CreateRoomDTO extends OmitUpdateType(Room, ['roomId']) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomAdress?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxClasses: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  onlineRoom?: string;

  @IsArray()
  @IsOptional()
  classIdList?: string[];
}
