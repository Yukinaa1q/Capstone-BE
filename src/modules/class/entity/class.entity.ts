import { Course } from '@modules/course/entity/course.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'classroom' })
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsUUID()
  classId: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  courseTitle?: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @Column()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxStudents: number;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  currentStudents?: number;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classCode: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studyWeek: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studyShift: string;

  @Column()
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isOnline: boolean;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  classRoom?: string;

  @ApiHideProperty()
  @ManyToOne(() => Tutor, (tutor) => tutor.classrooms, { eager: true })
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({ nullable: false })
  tutorId: string;

  @ApiHideProperty()
  @ManyToOne(() => Course, (course) => course.classrooms, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: false })
  courseId: string;

  @ManyToMany(() => Student, (student) => student.classrooms)
  @JoinTable({
    name: 'classroom_student', // Name of the join table
    joinColumn: { name: 'classroomId', referencedColumnName: 'classId' }, // Column for Classroom
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'userId' }, // Column for Student
  })
  students: Student[]; // Array of students in the classroom
}
