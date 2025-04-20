import { Injectable, Logger } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { GoogleAuth, JWT } from 'google-auth-library';
import { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL } from '@environment';
import { readFileSync } from 'fs';

@Injectable()
export class GoogleMeetService {
  private meet: any;

  constructor() {
    this.initializeGoogleClient();
  }

  private async initializeGoogleClient() {
    const keyFile = JSON.parse(
      readFileSync('src/credential/google-credential.json', 'utf8'),
    );
    try {
      // Use service account credentials for authentication
      const auth = new GoogleAuth({
        keyFile: keyFile.private_key,
        scopes: ['https://www.googleapis.com/auth/meetings.space.created'],
      });

      const authClient = (await auth.getClient()) as JWT;

      // Initialize Meet client with proper typing workaround
      this.meet = google.meet({
        version: 'v2',
        auth: authClient,
      });
    } catch (error) {
      throw error;
    }
  }

  async createMeetLink() {
    try {
      const response = await this.meet.spaces.create({
        requestBody: {
          config: {
            accessType: 'OPEN',
            entryPointAccess: 'ALL',
          },
        },
      });

      if (!response.data.meetingUri || !response.data.meetingCode) {
        throw new Error('Invalid response from Google Meet API');
      }

      return {
        meetingUri: response.data.meetingUri,
        meetingCode: response.data.meetingCode,
        meetingUrl: `https://meet.google.com/${response.data.meetingCode}`,
      };
    } catch (error) {
      console.error('Google Meet API Error:', error);
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }
}
