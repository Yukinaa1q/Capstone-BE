import { Injectable, Logger } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL } from '@environment';
import { readFileSync } from 'fs';

@Injectable()
export class GoogleMeetService {
  private calendar: calendar_v3.Calendar;
  private logger = new Logger(GoogleMeetService.name);

  constructor() {
    this.initializeGoogleClient();
  }

  private initializeGoogleClient() {
    const keyFile = JSON.parse(
      readFileSync('src/credential/google-credential.json', 'utf8'),
    );
    try {
      // Use service account credentials for authentication
      const auth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: keyFile.private_key,
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
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      // First create a basic event
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
      };

      // Create the event first
      const createdEvent = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      if (!createdEvent.data.id) {
        throw new Error('Failed to create event');
      }

      // Then update it with conference data
      const updatedEvent = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: createdEvent.data.id,
        conferenceDataVersion: 1,
        requestBody: {
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });

      if (!updatedEvent.data.hangoutLink) {
        throw new Error('Failed to add conference data to event');
      }

      return updatedEvent.data.hangoutLink;
    } catch (error) {
      this.logger.error(
        `Failed to create Google Meet link: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
