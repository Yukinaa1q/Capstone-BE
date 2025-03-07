import { Course } from '@modules/course/entity/course.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tutor_pre_reg' })
export class TutorPreReg {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  id: string;

  @ManyToOne(() => Course, (course) => course.courseId, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tutorId: string;

  @Column({ nullable: true, type: 'text', array: true })
  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  evenTimeShift?: string[];

  @Column({ nullable: true, type: 'text', array: true })
  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  oddTimeShift?: string[];

  @ApiPropertyOptional()
  @CreateDateColumn()
  createdTime?: Date = new Date();
}
