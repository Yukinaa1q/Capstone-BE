import { Classroom } from '@modules/class/entity/class.entity';
import { ClassRequest } from '@modules/courseRegistration/entity/requestClassCreation.entity';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export class Subsection {
  @IsString()
  subsectionTitle: string;
}

export class CourseContentItem {
  @IsArray()
  subsections: Subsection[];

  @IsString()
  sectionTitle: string;
}

@Entity({ name: 'course' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  // @Transform(({ value }) => value, { toClassOnly: true })
  // @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseSubject: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @Column()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseImage?: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseLevel: string;

  @Column()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  coursePrice: number;

  @Column({ default: 0 })
  @ApiProperty({ default: 0 })
  @IsNumber()
  participantNumber: number = 0;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseDescription: string;

  @Column({ default: 'none' })
  @ApiProperty()
  @IsString()
  courseOutline: string;

  @ApiHideProperty()
  @OneToMany(() => ClassRequest, (classRequest) => classRequest.course)
  classRequest: ClassRequest[];

  @ApiHideProperty()
  @OneToMany(() => Classroom, (classroom) => classroom.course)
  classrooms: Classroom[];

  @Column({ default: [], type: 'text', array: true })
  @IsArray()
  @ApiPropertyOptional()
  @IsOptional()
  classes?: string[];

  @Column({ nullable: true })
  @ApiProperty()
  @IsNumber()
  duration: number;
}
