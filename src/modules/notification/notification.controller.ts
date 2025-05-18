import { Sse } from '@nestjs/common';
import { ApiController } from '@services/openApi';
import { interval, map, Observable } from 'rxjs';
import { MessageEvent } from './dto/NotificationMessage.dto';
import { NotificationService } from './notification.service';

@ApiController('noti')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Sse('sse')
  sendNotification(): Observable<MessageEvent> {
    console.log('SSE connection established');
    return interval(1000).pipe(
      map(() => {
        return this.notificationService.sendNotification();
      }),
    );
  }
}
