import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '@modules/staff';
import { StaffModule } from '@modules/staff';
@Module({
  imports: [TypeOrmModule.forFeature([Staff]), StaffModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
