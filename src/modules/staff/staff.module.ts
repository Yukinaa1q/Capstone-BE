import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Staff, Tutor])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
