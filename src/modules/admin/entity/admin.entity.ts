import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@common/entity';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@Entity({ name: 'admin' })
export class Admin extends User {
  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsString()
  adminCode?: string;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
