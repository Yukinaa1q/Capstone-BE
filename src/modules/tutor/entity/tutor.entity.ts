import { User } from '@common/entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

export class QualifiedSubject {
  @IsString()
  subject: string;

  @IsString()
  level: string;
}

@Entity({ name: 'tutor' })
export class Tutor extends User {
  @Column({ default: [], type: 'jsonb', array: false })
  @ApiPropertyOptional()
  @IsArray()
  qualifiedSubject?: QualifiedSubject[];

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  tutorSSN?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  tutorCode?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  information?: string;

  @Column({ default: false })
  @ApiPropertyOptional()
  @IsBoolean()
  isVerified: boolean;

  @OneToMany(() => Classroom, (classroom) => classroom.tutor)
  classrooms: Classroom[];

  @Column({ default: [], type: 'text', array: true })
  @ApiProperty()
  @IsArray()
  classList: string[];

  @Column({ default: [], type: 'text', array: true })
  @ApiProperty()
  @IsArray()
  paidClassList: string[];

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
