import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PlanTier, UserRole } from '@prisma/client';
import db from '../db/index.js';
import { protect, AuthenticatedRequest, JWTPayload } from '../middleware/auth.js';
import { cacheUser, invalidateUserCache } from '../services/redis.js';
import logger from '../utils/logger.js';

const router: Router = Router();

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      companyId: user.companyId,
      teamId: user.teamId,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' } // Shorter expiry for access token
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const setTokenCookies = (res: Response, { accessToken, refreshToken }: { accessToken: string, refreshToken: string }) => {
  res.cookie('Authorization', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  res.cookie('RefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Sign Up (Only for Company Registration - Creates Admin)
router.post('/sign-up', async (req: Request, res: Response) => {
  const { name, email, password, companyName, phone } = req.body;

  try {
    const existingUser = await db.user.findUnique({ 
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        companyId: true,
        teamId: true,
      }
    });

    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    // Cache user data
    await cacheUser(user.id, user);

    res.status(201).json({ user });
  } catch (error) {
    logger.error('Signup Error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Sign In
router.post('/sign-in', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
        companyId: true,
        teamId: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    // Cache user data
    await cacheUser(user.id, userWithoutPassword);

    res.json({ user: userWithoutPassword, access_token: tokens.accessToken, refresh_token: tokens.refreshToken });
  } catch (error) {
    logger.error('Sign In Error:', error);
    res.status(500).json({ message: 'Error signing in' });
  }
});

// Refresh Token
router.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.RefreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key'
    ) as JWTPayload;

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        companyId: true,
        teamId: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    logger.error('Token Refresh Error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Sign Out
router.post('/sign-out', async (req: Request, res: Response) => {
  res.cookie('Authorization', '', { maxAge: 0 });
  res.cookie('RefreshToken', '', { maxAge: 0 });
  res.json({ message: 'Signed out successfully' });
});

// Get Current User
router.get('/me', protect, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        companyId: true,
        teamId: true,
        phone: true,
        avatar: true,
        designation: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get Current User Error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

export default router;
