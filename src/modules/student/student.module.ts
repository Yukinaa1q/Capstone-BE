import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { Classroom } from '@modules/class/entity/class.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Student, Classroom])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
