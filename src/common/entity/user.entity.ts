import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { stringToDate } from '@utils';
import { Exclude, Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  // @Transform(({ value }) => value, { toClassOnly: true })
  // @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsDate()
  @Transform(({ value }) => stringToDate(value))
  @IsOptional()
  DOB?: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @ApiHideProperty()
  @Exclude()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @CreateDateColumn()
  createdTime?: Date = new Date();

  @ApiPropertyOptional()
  @UpdateDateColumn()
  updatedTime?: Date;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  deletedTime?: Date = null;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => stringToDate(value))
  lastUpdateDataTime?: Date;
}
