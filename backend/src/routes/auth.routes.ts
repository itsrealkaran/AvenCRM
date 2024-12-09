import { Request, Response, Router, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import session from "express-session"

import db from '../db/index';
import { UserRole } from '@prisma/client';

// Define types for JWT payload and extended Request
interface JWTPayload {
  id: string;
  email: string;
  companyId?: string;
  role: UserRole;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

const router = Router();

//manual signup route
router.post('/sign-up', (async (req: Request, res: Response) => {
  const { name, email, password, dob, phone, companyId, gender } = req.body;

  try {
    if (email && password) {
      const checkExistingProfile = await db.agent.findFirst({
        where: {
          email,
        },
      });
      if (checkExistingProfile) {
        const token = jwt.sign(
          { profileId: checkExistingProfile.id },
          process.env.JWT_SECRET || 'nope',
        );
        res
          .status(400)
          .json({ access_token: token });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const profile = await db.agent.create({
        data: {
          name,
          email,
          password: hashedPassword,
          dob,
          phone,
          companyId,
          gender
        },
      });
      const token = jwt.sign(
        { profileId: profile.id },
        process.env.JWT_SECRET || 'nope',
      );
      res.cookie('Authorization', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      res.status(201).json({ access_token: token, user: profile });
    } else {
      res.status(409).send('fields are empty');
    }
  } catch (err) {
    res.send(err);
  }
}) as RequestHandler);

router.post('/admin/sign-up', (async (req: Request, res: Response) => {
  const { name, email, password, dob, phone, companyId, gender } = req.body;

  try {
    if (email && password) {
      const checkExistingProfile = await db.agent.findFirst({
        where: {
          email,
        },
      });
      if (checkExistingProfile) {
        const token = jwt.sign(
          { profileId: checkExistingProfile.id },
          process.env.JWT_SECRET || 'nope',
        );
        res
          .status(400)
          .json({ access_token: token });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const profile = await db.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      const token = jwt.sign(
        { profileId: profile.id },
        process.env.JWT_SECRET || 'nope',
      );
      res.cookie('Authorization', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      res.status(201).json({ access_token: token });
    } else {
      res.status(409).send('fields are empty');
    }
  } catch (err) {
    res.send(err);
  }
}) as RequestHandler);

//manual signin route
router.post('/sign-in', (async (req: Request, res: Response) => {
  
    const { email, password, role } = req.body;

    try {
      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required' });
      }

      let user: any;

      switch (role.toUpperCase()) {
        case UserRole.ADMIN:
          user = await db.admin.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true
            }
          });
          break;
        case UserRole.SUPERADMIN:
          user = await db.superAdmin.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true
            }
          });
          break;
        case UserRole.AGENT:
          user = await db.agent.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              role: true,
              companyId: true
            }
          });
          break;
        default:
          return res.status(400).json({ message: 'Invalid role' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Generate access token
      const accessToken = jwt.sign(
        {
          profileId: user.id,
          role: role.toLowerCase(),
          exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
        },
        process.env.JWT_SECRET || 'nope'
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        {
          profileId: user.id,
          role: role.toLowerCase()
        },
        process.env.REFRESH_TOKEN_SECRET || 'refresh-nope',
        { expiresIn: '7d' }
      );

      // Set secure cookie
      res.cookie('Authorization', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      return res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role.toLowerCase(),
          companyId: user.companyId || undefined
        }
      });

    } catch (error) {
      console.error('Sign-in error:', error);
      return res.status(500).json({
        message: 'An error occurred during sign-in',
        error: error
      });
    }
  }) as unknown as RequestHandler);

// Middleware to verify JWT token with proper types
const verifyToken = ((req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nope') as JWTPayload;
    
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}) as RequestHandler;

// Token validation endpoint with proper types
router.post('/validate-token', verifyToken, ((req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  res.status(200).json({ 
    valid: true,
    user: {
      id: user?.id,
      role: user?.role
    }
  });
}) as RequestHandler);

// Token refresh endpoint with proper types
router.post('/refresh-token', verifyToken, (async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Invalid user data' });
    }

    // Fetch latest user data
    let userRole: UserRole;
    let userDB: any;
    switch(user.role) {
      case UserRole.ADMIN:
        userDB = await db.admin.findUnique({
          where: { id: user.id },
          select: { id: true, }
        });
        userRole = UserRole.ADMIN;
        break;
      case UserRole.SUPERADMIN:
        userDB = await db.superAdmin.findUnique({
          where: { id: user.id },
          select: { id: true }
        });
        userRole = UserRole.SUPERADMIN;
        break;
      case UserRole.AGENT:
        userDB = await db.agent.findUnique({
          where: { id: user.id },
          select: { id: true, role: true }
        });
        userRole = UserRole.AGENT;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (!userDB) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        profileId: userDB.id,
        role: userRole,
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      },
      process.env.JWT_SECRET || 'nope',
      { expiresIn: '15m' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        profileId: userDB.id,
        role: userRole
      },
      process.env.REFRESH_TOKEN_SECRET || 'refresh-nope',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      accessToken: newToken,
      refreshToken,
      user: {
        id: userDB.id,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      message: 'Error refreshing token',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
}) as RequestHandler);

// //signin through google id
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_AUTH_CLIENT_ID || '',
//       clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
//       callbackURL: `http://localhost:8000/auth/google/callback`,
//     },
//     (accessToken, refreshToken, profile, cb) => {
//       return cb(null, profile);
//     },
//   ),
// );

router.get('/', (req, res) => {
  res.send(process.env.GOOGLE_AUTH_CLIENT_SECRET);
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  },
);

passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user || null));

export default router
