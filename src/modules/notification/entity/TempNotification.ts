import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Note: This work as a replacement for the queue as we are lack of time to implement the queue
@Entity({ name: 'temp_notification' })
export class TempNotification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  tempNotiId: string;

  @Column()
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;
}
