import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
class CourseContentItem {
  @IsString()
  title: string;

  @IsString()
  description: string;
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
  subject: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pId: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @Column()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseLevel: string;

  @Column()
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @Column({ default: 0 })
  @ApiProperty({ default: 0 })
  @IsNumber()
  participantNumber: number = 0;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseDetail: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ type: () => [CourseContentItem] })
  @IsArray()
  courseContent: CourseContentItem[];
}
