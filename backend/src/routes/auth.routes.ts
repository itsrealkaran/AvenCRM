import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import nodemailer from "nodemailer"
import db from "../db/index.js";
import {
  protect,
  AuthenticatedRequest,
  JWTPayload,
} from "../middleware/auth.js";
import { cacheUser, invalidateUserCache } from "../services/redis.js";
import logger from "../utils/logger.js";

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
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const setTokenCookies = (
  res: Response,
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
) => {
  res.cookie("Authorization", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 300 * 60 * 1000, // 5 hours
  });

  res.cookie("RefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Sign Up (Only for Company Registration - Creates Admin)
router.post("/sign-up", async (req: Request, res: Response) => {
  const { personalData, companyData } = req.body;
  const { name, email, password, gender, phone } = personalData;
  const {
    name: companyName,
    email: companyEmail,
    website,
    logo,
    phone: companyPhone,
    address,
    city,
    country,
    size,
    userCount,
    currency,
    countriesOfOperation,
    isFreeTrial,
  } = companyData;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser;
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS || 12));

    const response = await db.$transaction(async (tx) => {
      const admin = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          gender: gender?.toUpperCase(),
          phone,
          role: UserRole.ADMIN,
        },
      });
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          website,
          phone: companyPhone,
          address: `${address}, ${city}, ${country}`,
          size,
          userCount: isFreeTrial ? 5 : userCount,
          currency,
          adminId: admin.id,
          planName: isFreeTrial ? "BASIC" : null,
          planType: isFreeTrial ? "COMPANY" : null,
          planEnd: isFreeTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined,
        },
      });
      const updatedAdmin = await tx.user.update({
        where: { id: admin.id },
        data: {
          companyId: company.id,
        },
      });

      if (isFreeTrial) {
        await tx.plan.update({
          where: { name: "BASIC" },
          data: {
            companies: {
              connect: {
                id: company.id,
              },
            },
          },
        })
      }
      
      return updatedAdmin;
    });

    const { password: _, ...userWithoutPassword } = response;

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: 'info@avencrm.com', // sender address
        to: email, // list of receivers
        subject: "Welcome to AvenCRM! 🏠", // Subject line
        text: "Welcome to AvenCRM - Your Premier Real Estate Management Solution", // plain text body
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7C3AED; text-align: center;">Welcome to AvenCRM! 🏠</h1>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for choosing AvenCRM as your real estate management platform. We're excited to help you streamline your property management and grow your business.
            </p>

            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #6D28D9; margin-top: 0;">What you can do with AvenCRM:</h2>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 10px 0;">📊 Manage your property portfolio</li>
                <li style="margin: 10px 0;">🏢 List and track properties</li>
                <li style="margin: 10px 0;">📝 Create detailed property records</li>
                <li style="margin: 10px 0;">📍 Track location-based information</li>
                <li style="margin: 10px 0;">📸 Manage your leads and deals</li>
              </ul>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">
              Get started by exploring our intuitive dashboard and creating your first property listing. If you need any assistance, our support team is here to help!
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://crm.avencrm.com/" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>

            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Best regards,<br>
              The AvenCRM Team
            </p>
          </div>
        `, // html body
      });


    } catch (err) {
      console.log("error sending an email", err)
    }
    // Cache user data
    await cacheUser(response.id, userWithoutPassword);

    res.status(201).json({ userId: response.id, companyId: response.companyId });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Sign In
router.post("/sign-in", async (req: Request, res: Response) => {
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
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    // Cache user data
    await cacheUser(user.id, userWithoutPassword);

    res.json({
      user: userWithoutPassword,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
  } catch (error) {
    logger.error("Sign In Error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

router.post("/sign-in/agents", async (req: Request, res: Response) => {
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
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role === "ADMIN") {
      return res.status(401).json({ message: "Admins cannot sign in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    // Cache user data
    await cacheUser(user.id, userWithoutPassword);

    res.json({
      user: userWithoutPassword,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
  } catch (error) {
    logger.error("Sign In Error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// Refresh Token
router.post("/refresh-token", async (req: Request, res: Response) => {
  const refreshToken = req.cookies.RefreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key"
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
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    logger.error("Token Refresh Error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Sign Out
router.post("/sign-out", async (req: Request, res: Response) => {
  res.cookie("Authorization", "", { maxAge: 0 });
  res.cookie("RefreshToken", "", { maxAge: 0 });
  res.json({ message: "Signed out successfully" });
});

// Get Current User
router.get("/me", protect, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
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
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Get Current User Error:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

router.get('/currency', protect, async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: {
        currency: true,
      },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ currency: company.currency || "USD" });
  } catch (error) {
    logger.error("Get Currency Error:", error);
    res.status(500).json({ message: "Error fetching currency" });
  }
});

router.patch('/set-currency', protect, async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { currency } = req.body;
  try {
      await db.company.update({
      where: { id: companyId },
      data: { currency },
    });

    res.json({ message: "Currency set successfully" });
  } catch (error) {
    logger.error("Set Currency Error:", error);
    res.status(500).json({ message: "Error setting currency" });
  }
});

router.get('/company', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if(user.role === UserRole.SUPERADMIN) {
      return res.json(null)
    }

    const company = await db.company.findUnique({
      where: { id: user.companyId },
      select: {
        userCount: true,
        planName: true,
        planType: true,
        billingFrequency: true,
        planEnd: true,
      },
    });

    res.json(company);
  } catch (error) {
    logger.error("Get Company Error:", error);
    res.status(500).json({ message: "Error fetching company data" });
  }
});

export default router;
