import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  notificationId: string;

  @Column()
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Column({ default: false })
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;
}
