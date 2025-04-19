import { Module } from '@nestjs/common';
import { GoogleMeetService } from './google.service';

@Module({
  providers: [GoogleMeetService],
  exports: [GoogleMeetService],
})
export class GoogleModule {}
