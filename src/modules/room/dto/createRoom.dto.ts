import { OmitUpdateType } from '@services/openApi';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Room } from '@modules/courseRegistration/entity/room.entity';

export class CreateRoomDTO extends OmitUpdateType(Room, ['roomId']) {
  @IsBoolean()
  isOnline: boolean;

  @IsString()
  @IsOptional()
  roomCode?: string;

  @IsString()
  @IsOptional()
  roomAddress?: string;
}
