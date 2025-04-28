import { Classroom } from '@modules/class/entity/class.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entity/grade.entity';
import { Student } from '@modules/student/entity/student.entity';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom, Grade, Student])],
  controllers: [GradeController],
  providers: [GradeService],
  exports: [GradeService],
})
export class GradeModule {}
