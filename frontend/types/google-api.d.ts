interface TokenResponse {
  access_token: string;
  error?: string;
}

interface TokenClient {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (options: { prompt: string }) => void;
}

interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: string | ((response: TokenResponse) => void);
      }): TokenClient;
    };
  };
}

interface GapiLoadConfig {
  callback: () => void;
  onerror?: () => void;
}

interface GapiClient {
  init(config: {
    apiKey: string;
    discoveryDocs: string[];
  }): Promise<void>;
  getToken(): null | { access_token: string };
  calendar: {
    events: {
      list(params: any): Promise<any>;
      insert(params: any): Promise<any>;
      update(params: any): Promise<any>;
      delete(params: any): Promise<any>;
    };
  };
}

interface Gapi {
  load(api: string, config: GapiLoadConfig): void;
  client: GapiClient;
}

declare global {
  interface Window {
    gapi: Gapi;
    google: GoogleIdentityServices;
  }
}
