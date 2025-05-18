import { Injectable } from '@nestjs/common';
import { MessageEvent } from './dto/NotificationMessage.dto';

@Injectable()
export class NotificationService {
  sendNotification(): MessageEvent {
    return {
      data: {
        receiverId: '12345',
        message: 'Hello, this is a notification message!',
      },
    };
  }
}
