import { IsNumber, IsString } from 'class-validator';

export class ViewAllRoomsDTO {
  @IsString()
  roomId: string;

  @IsString()
  roomCode: string;

  @IsString()
  roomAddress: string;

  @IsString()
  onlineRoom: string;

  @IsNumber()
  maxClasses: number;

  @IsNumber()
  currentClasses: number;
}
