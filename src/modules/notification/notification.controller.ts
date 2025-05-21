import { Get, Param, Post, Sse } from '@nestjs/common';
import { ApiController } from '@services/openApi';
import { interval, map, mergeMap, Observable } from 'rxjs';
import { MessageEvent } from './interface/NotificationMessage.dto';
import { NotificationService } from './notification.service';

@ApiController('noti')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Sse('sse')
  sendNotification(): Observable<MessageEvent> {
    return interval(5000).pipe(
      mergeMap(() =>
        this.notificationService.pingNotification().then((data) => {
          return data;
        }),
      ),
    );
  }

  @Get('/:userId')
  getUserNotification(@Param('userId') userId: string) {
    return this.notificationService.getAllNotifications(userId);
  }

  @Post('/markAsRead/:userId/:notificationId')
  markAsRead(
    @Param('notificationId') notificationId: string,
    @Param('userId') userId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Post('/markAllAsRead/:userId')
  markAsReadAll(@Param('userId') userId: string) {
    return this.notificationService.markAsReadAll(userId);
  }
}
