import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  // imports: [TypeOrmModule.forFeature([Tutor, Classroom])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [],
})
export class NotificationModule {}
