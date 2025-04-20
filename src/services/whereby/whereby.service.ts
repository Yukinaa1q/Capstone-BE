import { WHEREBY_API_TOKEN } from '@environment';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { addMonths } from 'date-fns';

@Injectable()
export class WherebyService {
  private readonly logger = new Logger(WherebyService.name);
  private readonly apiKey = WHEREBY_API_TOKEN;

  async createMeetingLink(
    meetingName: string = 'Tutoring Session',
    duration: number,
  ): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.whereby.dev/v1/meetings',
        {
          roomNamePrefix: meetingName.toLowerCase().replace(/\s+/g, '-'),
          endDate: addMonths(new Date(), duration).toISOString(), 
          isLocked: false,
          roomMode: 'group',
          roomNamePattern: 'uuid',
          templateType: 'viewerMode',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response;
    } catch (error) {
      this.logger.error(`Whereby API Error: ${error.message}`);
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }
}
