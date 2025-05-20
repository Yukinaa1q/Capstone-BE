import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Notification } from './entity/Notification';
import { TempNotification } from './entity/TempNotification';
import { MessageEvent } from './interface/NotificationMessage.dto';

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
        tempNotiRepo.delete(tempNoti.tempNotiId); // Delete the notification after sending
        await queryRunner.commitTransaction();
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
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async getAllNotifications(userId: string) {
    // TODO: Implement logic to fetch all notifications for the user
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();
    const notiRepo = queryRunner.manager.getRepository(Notification);
    try {
      const notificationList = await notiRepo.find({
        where: { receiverId: userId, isRead: false },
      });
      await queryRunner.commitTransaction();
      return notificationList;
    } catch {
      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    const notfiRepo = this.dataSource.manager.getRepository(Notification);
    const findNoti = await notfiRepo.findOne({
      where: { notificationId: notificationId, receiverId: userId },
    });
    if (findNoti) {
      findNoti.isRead = true;
      await notfiRepo.save(findNoti);
    }
  }

  async markAsReadAll(userId: string) {
    const notfiRepo = this.dataSource.manager.getRepository(Notification);
    const findNotiList = await notfiRepo.find({
      where: { receiverId: userId },
    });

    for (const notification of findNotiList) {
      notification.isRead = true;
      await notfiRepo.save(notification);
    }
  }

  sendNotification(receiverId: string, message: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    try {
      const notiRepo = queryRunner.manager.getRepository(Notification);
      const tempNotiRepo = queryRunner.manager.getRepository(TempNotification);
      // Create a new notification
      const newNotification = new Notification();
      newNotification.receiverId = receiverId;
      newNotification.message = message;
      newNotification.isRead = false;

      // Create a new temp notification
      const newTempNotification = new TempNotification();
      newTempNotification.receiverId = receiverId;

      // Save the new notification and temp notification
      notiRepo.save(newNotification);
      tempNotiRepo.save(newTempNotification);
      queryRunner.commitTransaction();
    } catch {
      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }
  }
}
