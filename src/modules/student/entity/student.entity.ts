import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@common/entity';
import { IsBoolean, IsNotEmpty } from 'class-validator';

@Entity({ name: 'student' })
export class Student extends User {
  @Column({ default: false })
  @ApiProperty({ default: false })
  @IsBoolean()
  firstCreated: boolean = false;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
