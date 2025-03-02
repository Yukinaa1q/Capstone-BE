import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  roomId: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @Column()
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  occupied: boolean;
}
