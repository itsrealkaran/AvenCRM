import { verify } from 'crypto';
import { Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import session from "express-session"

import db from '../db/index';

const router = Router();

//manual signup route
router.post('/sign-up', async (req: Request, res: Response) => {
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
          { profile: checkExistingProfile },
          process.env.JWT_SECRET || 'nope',
        );
        res
          .status(400)
          .json({ access_token: token, user: checkExistingProfile });
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
        { profile: profile },
        process.env.JWT_SECRET || 'nope',
      );
      res.cookie('Authentication', token, {
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
});

//maual signin route
router.post('/sign-in', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (email && password) {
      const checkExistingProfile = await db.agent.findFirst({
        where: {
          email,
        },
      });
      if (checkExistingProfile) {
        if (bcrypt.compareSync(password, checkExistingProfile.password)) {
          const token = jwt.sign(
            { profile: checkExistingProfile },
            process.env.JWT_SECRET || 'nope',
          );
          res.cookie('Authentication', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          console.log(res.cookie);
          res
            .status(200)
            .json({ access_token: token, user: checkExistingProfile });
        } else {
          res.status(400).json({ message: 'wrong passord' });
        }
      } else {
        res.status(409).json({ message: 'profile not found' });
      }
    }
  } catch (err) {
    res.send(err);
  }
});

//signin through google id

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
      callbackURL: `http://localhost:8000/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, cb) => {
      return cb(null, profile);
    },
  ),
);

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
passport.deserializeUser((user, done) => done(null, user || null));

export { router as authRouter };
