declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private isInitialized = false;
  private tokenClient: any = null;

  private constructor() {}

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadScripts();
      await this.initializeGapiClient();
      this.initializeTokenClient();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
      throw error;
    }
  }

  private loadScripts(): Promise<void> {
    return Promise.all([
      // Load the Google API client library
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google API script'));
        document.body.appendChild(script);
      }),
      // Load the Google Identity Services library
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.body.appendChild(script);
      })
    ]).then(() => {});
  }

  private async initializeGapiClient(): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('Google Calendar API key not configured');
    }

    return new Promise<void>((resolve, reject) => {
      window.gapi.load('client', {
        callback: async () => {
          try {
            await window.gapi.client.init({
              apiKey: apiKey,
              discoveryDocs: [DISCOVERY_DOC],
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => reject(new Error('Failed to load GAPI client')),
      });
    });
  }

  private initializeTokenClient(): void {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google client ID not configured');
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: '', // defined at request time
    });
  }

  async signIn(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.callback = async (response: any) => {
          if (response.error) {
            reject(response);
            return;
          }
          resolve(response.access_token);
        };

        if (window.gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          // Skip display of account chooser and consent dialog
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async listEvents(): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime',
      });

      return response.result.items.map((event: any) => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        location: event.location,
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async createEvent(event: any): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: event.location,
        },
      });

      return {
        id: response.result.id,
        title: response.result.summary,
        description: response.result.description,
        start: new Date(response.result.start.dateTime || response.result.start.date),
        end: new Date(response.result.end.dateTime || response.result.end.date),
        location: response.result.location,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: any): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: event.location,
        },
      });

      return {
        id: response.result.id,
        title: response.result.summary,
        description: response.result.description,
        start: new Date(response.result.start.dateTime || response.result.start.date),
        end: new Date(response.result.end.dateTime || response.result.end.date),
        location: response.result.location,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
