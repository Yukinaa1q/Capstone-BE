import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity({ name: 'room_occupied' })
export class RoomOccupied {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  id: string;

  @Column()
  @ApiProperty()
  @IsString()
  studyShift: string;

  @Column()
  @ApiProperty()
  @IsString()
  studyWeek: string;

  @ManyToOne(() => Room, (room) => room.occupancies)
  room: Room;

  @Column({ name: 'roomId' })
  roomId: string;
}
