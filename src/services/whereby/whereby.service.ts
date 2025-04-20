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

  // New method to delete a meeting by its ID
  async deleteMeeting(meetingId: string): Promise<boolean> {
    try {
      this.logger.log(`Attempting to delete Whereby meeting: ${meetingId}`);

      const response = await axios.delete(
        `https://api.whereby.dev/v1/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      // If we get here, the delete was successful (Whereby returns 204 No Content)
      this.logger.log(`Successfully deleted Whereby meeting: ${meetingId}`);
      return true;
    } catch (error) {
      // Check if it's a 404 error, which means the meeting doesn't exist anymore
      if (error.response && error.response.status === 404) {
        this.logger.warn(
          `Meeting ${meetingId} not found - may have already been deleted`,
        );
        return true; // Consider this a successful deletion since the meeting doesn't exist
      }

      this.logger.error(`Whereby API Error (Delete): ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(
          `Response data: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
  }
}
