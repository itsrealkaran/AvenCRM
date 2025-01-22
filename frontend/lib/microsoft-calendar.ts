import { AuthenticationResult, PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';

export class MicrosoftCalendarService {
  private static instance: MicrosoftCalendarService;
  private msalClient: PublicClientApplication;
  private graphClient: Client | null = null;
  private initialized: boolean = false;

  private constructor() {
    this.msalClient = new PublicClientApplication({
      auth: {
        clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: typeof window !== 'undefined' ? `${window.location.href}` : '',
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    });
  }

  static getInstance(): MicrosoftCalendarService {
    if (!MicrosoftCalendarService.instance) {
      MicrosoftCalendarService.instance = new MicrosoftCalendarService();
    }
    return MicrosoftCalendarService.instance;
  }

  private async initialize() {
    if (!this.initialized) {
      await this.msalClient.initialize();
      this.initialized = true;
    }
  }

  async isConnected(): Promise<boolean> {
    await this.initialize();
    const accounts = this.msalClient.getAllAccounts();
    return accounts.length > 0;
  }

  async login(): Promise<void> {
    try {
      await this.initialize();

      // Check if there's already an active account
      const accounts = this.msalClient.getAllAccounts();
      if (accounts.length > 0) {
        // Use the first account if available
        const silentRequest = {
          scopes: ['Calendars.ReadWrite'],
          account: accounts[0],
        };

        try {
          const result = await this.msalClient.acquireTokenSilent(silentRequest);
          await this.initializeGraphClient(result);
          return;
        } catch (error) {
          // Silent token acquisition failed, fall back to interactive method
        }
      }
      const result = await this.msalClient.loginPopup({
        scopes: ['Calendars.ReadWrite'],
      });
      await this.initializeGraphClient(result);
    } catch (error) {
      console.error('Error during Microsoft login:', error);
      throw error;
    }
  }

  async listEvents(startDate?: Date, endDate?: Date): Promise<any[]> {
    if (!this.graphClient) {
      throw new Error('Not authenticated with Microsoft');
    }

    try {
      const response = await this.graphClient
        .api('/me/calendar/events')
        .select('subject,start,end,bodyPreview')
        .get();

      return response.value.map((event: any) => ({
        id: event.id,
        title: event.subject,
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        description: event.bodyPreview,
        source: 'microsoft',
      }));
    } catch (error) {
      console.error('Error fetching Microsoft events:', error);
      throw error;
    }
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
  }): Promise<any> {
    if (!this.graphClient) {
      throw new Error('Not authenticated with Microsoft');
    }

    try {
      const event = {
        subject: eventData.title,
        body: {
          contentType: 'text',
          content: eventData.description || '',
        },
        start: {
          dateTime: eventData.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventData.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: eventData.location
          ? {
              displayName: eventData.location,
            }
          : undefined,
      };

      const response = await this.graphClient.api('/me/calendar/events').post(event);

      return {
        id: response.id,
        title: response.subject,
        start: new Date(response.start.dateTime),
        end: new Date(response.end.dateTime),
        description: response.body?.content,
        location: response.location?.displayName,
        source: 'microsoft',
      };
    } catch (error) {
      console.error('Error creating Microsoft event:', error);
      throw error;
    }
  }

  async updateEvent(
    eventId: string,
    eventData: {
      title: string;
      description?: string;
      start: Date;
      end: Date;
      location?: string;
    }
  ): Promise<any> {
    if (!this.graphClient) {
      throw new Error('Not authenticated with Microsoft');
    }

    try {
      const event = {
        subject: eventData.title,
        body: {
          contentType: 'text',
          content: eventData.description || '',
        },
        start: {
          dateTime: eventData.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventData.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: eventData.location
          ? {
              displayName: eventData.location,
            }
          : undefined,
      };

      const response = await this.graphClient.api(`/me/calendar/events/${eventId}`).patch(event);

      return {
        id: response.id,
        title: response.subject,
        start: new Date(response.start.dateTime),
        end: new Date(response.end.dateTime),
        description: response.body?.content,
        location: response.location?.displayName,
        source: 'microsoft',
      };
    } catch (error) {
      console.error('Error updating Microsoft event:', error);
      throw error;
    }
  }

  private async initializeGraphClient(authResult: AuthenticationResult) {
    this.graphClient = Client.init({
      authProvider: (callback) => {
        callback(null, authResult.accessToken);
      },
    });
  }
}
