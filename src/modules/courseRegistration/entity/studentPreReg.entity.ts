import { Course } from '@modules/course/entity/course.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
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

@Entity({ name: 'student_pre_reg' })
export class StudentPreReg {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  id: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId: string;

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
  @IsBoolean()
  @IsNotEmpty()
  isOnline: boolean;

  @ApiPropertyOptional()
  @CreateDateColumn()
  createdTime?: Date = new Date();
}
