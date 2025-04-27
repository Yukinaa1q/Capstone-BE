import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
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
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '@modules/student/entity/student.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'grade' })
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  gradeId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiPropertyOptional()
  @IsDecimal()
  midtermScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiPropertyOptional()
  @IsDecimal()
  assignmentScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiPropertyOptional()
  @IsDecimal()
  homeworkScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiPropertyOptional()
  @IsDecimal()
  finalScore: number;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: false })
  studentId: string;

  @ManyToOne(() => Classroom, { eager: true })
  @JoinColumn({ name: 'classroomId' })
  classroom: Classroom;

  @Column({ nullable: false })
  classroomId: string;

  @CreateDateColumn()
  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  @IsDate()
  updatedAt: Date;
}
