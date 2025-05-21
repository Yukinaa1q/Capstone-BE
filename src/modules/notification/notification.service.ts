import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/Notification';
import { TempNotification } from './entity/TempNotification';
import { MessageEvent } from './interface/NotificationMessage.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(TempNotification)
    private readonly tempNotificationRepository: Repository<TempNotification>,
  ) {}
  async pingNotification(): Promise<MessageEvent> {
    const tempNoti = await this.tempNotificationRepository
      .createQueryBuilder('TempNotification')
      .where('1=1')
      .getOne(); // Get randomly one notification

    // There is a notification in the TempNotification table
    if (tempNoti) {
      console.log('there is a notification, sending it');
      this.tempNotificationRepository.delete(tempNoti.tempNotiId); // Delete the notification after sending
      return {
        data: {
          receiverId: tempNoti.receiverId,
          message: 'New notification',
        },
      };
    }

    // Currently no notfication
    return {
      data: {
        receiverId: '',
        message: 'No new notification',
      },
    };
  }

  async getAllNotifications(userId: string) {
    // TODO: Implement logic to fetch all notifications for the user
    const notificationList = await this.notificationRepository.find({
      where: { receiverId: userId, isRead: false },
    });
    return notificationList;
  }

  async markAsRead(notificationId: string, userId: string) {
    const findNoti = await this.notificationRepository.findOne({
      where: { notificationId: notificationId, receiverId: userId },
    });
    if (findNoti) {
      findNoti.isRead = true;
      await this.notificationRepository.save(findNoti);
    }
    return 'Notification marked as read';
  }

  async markAsReadAll(userId: string) {
    const findNotiList = await this.notificationRepository.find({
      where: { receiverId: userId },
    });

    for (const notification of findNotiList) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }
  }

  sendNotification(receiverId: string, message: string) {
    // Create a new notification
    const newNotification = new Notification();
    newNotification.receiverId = receiverId;
    newNotification.message = message;
    newNotification.isRead = false;

    // Create a new temp notification
    const newTempNotification = new TempNotification();
    newTempNotification.receiverId = receiverId;

    // Save the new notification and temp notification
    this.notificationRepository.save(newNotification);
    this.tempNotificationRepository.save(newTempNotification);
  }
}
