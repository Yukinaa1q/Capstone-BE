import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stat } from './entity/stat.entity';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';
import { Classroom } from '@modules/class/entity/class.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Student } from '@modules/student/entity/student.entity';
import { Course } from '@modules/course/entity/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stat, Classroom, Tutor, Student, Course]),
  ],
  controllers: [StatController],
  providers: [StatService],
})
export class StatModule {}
