import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@common/entity';
import { IsEnum, IsString } from 'class-validator';

export type Role =
  | 'admin'
  | 'student'
  | 'parent'
  | 'tutor'
  | 'academic'
  | 'support';

export enum staffRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  PARENT = 'parent',
  TUTOR = 'tutor',
  ACADEMIC = 'academic',
  SUPPORT = 'support',
}
@Entity({ name: 'staff' })
export class Staff extends User {
  @Column({
    type: 'enum',
    enum: staffRole,
    default: staffRole.ACADEMIC,
    nullable: false,
  })
  @ApiProperty({ enum: staffRole, description: 'Staff role type' })
  @IsEnum(staffRole)
  role: Role;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  staffCode?: string;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
