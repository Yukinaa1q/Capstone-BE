import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ViewAllRoomsDTO {
  @IsString()
  roomId: string;

  @IsString()
  @Transform(({ value }) => value || 'None')
  roomCode: string;

  @IsString()
  @Transform(({ value }) => value || 'None')
  roomAddress: string;

  @IsString()
  @Transform(({ value }) => value || 'None')
  onlineRoom: string;

  @IsNumber()
  maxClasses: number;

  @IsNumber()
  @Transform(({ value }) => value ?? 0)
  currentClasses: number;
}
