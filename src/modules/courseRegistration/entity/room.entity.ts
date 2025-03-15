import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Classroom } from '@modules/class/entity/class.entity';

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  roomId: string;

  @Column({ nullable: true })
  @ApiProperty()
  @IsString()
  roomCode?: string;

  @Column()
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  occupied: boolean;

  @Column({ nullable: true })
  @ApiProperty()
  @IsString()
  roomAddress?: string;

  @Column()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxClasses: number;

  @Column({ nullable: true })
  @ApiProperty()
  @IsString()
  onlineRoom?: string;

  @OneToMany(() => Classroom, (classroom) => classroom.room)
  classes: Classroom[];

  @Column('simple-array', { nullable: true })
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  classesIdList: string[];
}
