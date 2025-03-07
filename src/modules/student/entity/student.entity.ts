import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, ManyToMany } from 'typeorm';
import { User } from '@common/entity';
import { IsBoolean, IsString } from 'class-validator';
import { Classroom } from '@modules/class/entity/class.entity';

@Entity({ name: 'student' })
export class Student extends User {
  @Column({ default: false })
  @ApiProperty({ default: false })
  @IsBoolean()
  firstCreated: boolean = false;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  studentCode?: string;

  @ManyToMany(() => Classroom, (classroom) => classroom.students, {
    eager: true,
  })
  classrooms: Classroom[]; // Array of classrooms the student belongs to

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
