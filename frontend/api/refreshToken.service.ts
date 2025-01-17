import axios from 'axios';

class RefreshTokenService {
  private static instance: RefreshTokenService;

  private constructor() {}

  public static getInstance(): RefreshTokenService {
    if (!RefreshTokenService.instance) {
      RefreshTokenService.instance = new RefreshTokenService();
    }
    return RefreshTokenService.instance;
  }

  public async refresh(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
        { refreshToken },
        { withCredentials: true }
      );

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);

      return accessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  }
}

export const refreshTokenService = RefreshTokenService.getInstance();
