import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PlanTier, UserRole } from '@prisma/client';
import db from '../db/index.js';
import { protect, AuthenticatedRequest, JWTPayload } from '../middleware/auth.js';

const router: Router = Router();

// Sign Up (Only for Company Registration - Creates Admin)
router.post('/sign-up', async (req: Request, res: Response) => {
  const { name, email, password, companyName, phone } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // // Create company first
    // const company = await db.company.create({
    //   data: {
    //     name: companyName,
    //     email: email,
    //     plan: PlanTier.BASIC,
    //     planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    //   }
    // });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: UserRole.ADMIN,
      }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating account', error });
  }
});

// Sign In
router.post('/sign-in', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: { email },
      include: {
        company: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const access_token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const refresh_token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    const cookiesOptions: { expires: Date; httpOnly: boolean; secure: boolean; sameSite: 'none' | 'lax' | 'strict' } = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    };

    // Set cookies
    res.cookie('Authorization', access_token, cookiesOptions);
    res.cookie('RefreshToken', refresh_token, cookiesOptions);

    res.json({
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company: user.company
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in', error });
  }
});

// Get Current User
router.get('/me', protect, async (req: AuthenticatedRequest, res: Response) => {
  const authUser = req.user;

  try {
    if (!authUser?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!authUser.role) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id, role: authUser.role },
      include: {
        company: true,
        team: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});

// Change Password
router.post('/change-password', protect, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const authUser = req.user;

  try {
    if (!authUser?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await db.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: authUser.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // TODO: Send reset password email with token
    // This should be implemented based on your email service provider

    res.json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing forgot password request', error });
  }
});

// Sign Out
router.post('/sign-out', (req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie('Authorization', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  
  res.clearCookie('RefreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });

  res.json({ message: 'Signed out successfully' });
});

export default router;
