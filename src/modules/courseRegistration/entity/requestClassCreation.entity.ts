import { Course } from '@modules/course/entity/course.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, IsUUID } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('class-request')
export class ClassRequest {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  requestId: string;

  @ApiHideProperty()
  @ManyToOne(() => Tutor, (tutor) => tutor.classRequest, { eager: true })
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({ nullable: false })
  tutorId: string;

  @ApiHideProperty()
  @ManyToOne(() => Course, (course) => course.classRequest, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: false })
  courseId: string;

  @Column()
  @ApiProperty()
  @IsString()
  studyWeek: string;

  @Column()
  @ApiProperty()
  @IsString()
  studyShift: string;

  @Column()
  @ApiProperty()
  @IsBoolean()
  isOnline: boolean;
}
