import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { Stat } from '@modules/stats/entity/stat.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Student, Classroom, Stat])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
