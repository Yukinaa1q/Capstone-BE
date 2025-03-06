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
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tutor_pre_reg' })
export class TutorPreReg {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  id: string;

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

/**
 * export class TutorPreReg {
 *  id: string;
 *  courseId: string;
 *  tutorId: string;
 *  studyWeek: string: 2-4-6 | 3-5-7;
 *  timeShift: string; 17h45 - 19h15 | 19h30 - 21h00;
 *  createdTime: Date;
 * }
 * e.g:
 * Một tutor đăng ký một môn nhiều buổi dạy giờ dạy
 * {
 *  id: '1',
 *  courseId: 'CO1001',
 *  tutorId: 'TU001',
 *  studyWeek: '2-4-6',
 *  timeShift: '17h45 - 19h15',
 *  ...
 * },
 * {
 *  id: '2',
 *  courseId: 'CO1001',
 *  tutorId: 'TU001',
 *  studyWeek: '2-4-6',
 *  timeShift: '19h30 - 21h00',
 *  ...
 * }
 */
