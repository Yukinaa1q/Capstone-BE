import { Injectable, Logger } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL } from '@environment';

@Injectable()
export class GoogleMeetService {
  private calendar: calendar_v3.Calendar;
  private logger = new Logger(GoogleMeetService.name);

  constructor() {
    this.initializeGoogleClient();
  }

  private initializeGoogleClient() {
    try {
      // Use service account credentials for authentication
      const auth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
    } catch (error) {
      this.logger.error('Failed to initialize Google client', error);
      throw error;
    }
  }

  async createMeetLink(): Promise<string> {
    try {
      // Create a calendar event with default values
      // We'll set the time to current time + 1 hour for duration
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const event = {
        summary: `Meet - ${new Date().toISOString()}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const result = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      });

      if (!result.data.hangoutLink) {
        throw new Error('Failed to create Google Meet link');
      }

      return result.data.hangoutLink;
    } catch (error) {
      this.logger.error(
        `Failed to create Google Meet link: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
