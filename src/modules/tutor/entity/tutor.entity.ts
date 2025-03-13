import { User } from '@common/entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @Column({ default: [], type: 'jsonb', array: true })
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

  @ApiPropertyOptional()
  @OneToMany(() => Classroom, (classroom) => classroom.tutor)
  classrooms?: Classroom[];

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
