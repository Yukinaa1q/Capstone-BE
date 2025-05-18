import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'stat' })
export class Stat {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  // @Transform(({ value }) => value, { toClassOnly: true })
  // @IsNotEmpty()
  @IsUUID()
  statId: string;

  @Column()
  @ApiProperty()
  @IsString()
  type: string;

  @Column()
  @ApiProperty()
  @IsNumber()
  value: number;

  @Column()
  @ApiProperty()
  @IsString()
  userId: string;

  @Column()
  @ApiProperty()
  @IsString()
  classId: string;

  @CreateDateColumn()
  @ApiPropertyOptional()
  createdTime?: Date = new Date();
}
