import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MessageEvent } from './interface/NotificationMessage.dto';
import { TempNotification } from './entity/TempNotification';

@Injectable()
export class NotificationService {
  constructor(private dataSource: DataSource) {}
  async pingNotification(): Promise<MessageEvent> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tempNotiRepo = queryRunner.manager.getRepository(TempNotification);

      const tempNoti = await tempNotiRepo
        .createQueryBuilder('TempNotification')
        .where('1=1')
        .getOne(); // Get randomly one notification

      // There is a notification in the TempNotification table
      if (tempNoti) {
        return {
          data: {
            receiverId: tempNoti.receiverId,
            message: 'New notification',
          },
        };
      }

      // Currently no notfication
      return {
        data: null,
      };

      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  getAllNotifications(userId: string) {
    // TODO: Implement logic to fetch all notifications for the user
  }

  markAsRead(notificationId: string, userId: string) {}

  markAsReadAll(userId: string) {}

  sendNotification(receiverId: string, message: string) {}
}
