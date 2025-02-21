import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomController } from './class.controller';
import { ClassroomService } from './class.service';
import { Course } from '@modules/course/entity/course.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Classroom } from './entity/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom])],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
