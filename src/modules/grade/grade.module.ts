import { Classroom } from '@modules/class/entity/class.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entity/grade.entity';
import { Student } from '@modules/student/entity/student.entity';
import { GradeService } from './grade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom, Grade, Student])],
  providers: [GradeService],
  exports: [GradeService],
})
export class GradeModule {}
