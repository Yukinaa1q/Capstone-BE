import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

class Subsection {
  @IsString()
  subsectionTitle: string;
}

class CourseContentItem {
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

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ type: () => [CourseContentItem] })
  @IsArray()
  courseOutline: CourseContentItem[];
}
