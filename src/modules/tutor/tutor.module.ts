import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { Tutor } from './entity/tutor.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { ClassRequest } from '@modules/courseRegistration/entity/requestClassCreation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tutor, Classroom, ClassRequest])],
  controllers: [TutorController],
  providers: [TutorService],
  exports: [TutorService],
})
export class TutorModule {}
