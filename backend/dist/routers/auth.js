"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_1 = __importDefault(require("../db/index"));
const router = (0, express_1.Router)();
exports.authRouter = router;
//manual signup route
router.post('/sign-up', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, dob, phone, companyId, gender } = req.body;
    try {
        if (email && password) {
            const checkExistingProfile = yield index_1.default.agent.findFirst({
                where: {
                    email,
                },
            });
            if (checkExistingProfile) {
                const token = jsonwebtoken_1.default.sign({ profileId: checkExistingProfile.id }, process.env.JWT_SECRET || 'nope');
                res
                    .status(400)
                    .json({ access_token: token });
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 12);
            const profile = yield index_1.default.agent.create({
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
            const token = jsonwebtoken_1.default.sign({ profileId: profile.id }, process.env.JWT_SECRET || 'nope');
            res.cookie('Authorisation', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            });
            res.status(201).json({ access_token: token, user: profile });
        }
        else {
            res.status(409).send('fields are empty');
        }
    }
    catch (err) {
        res.send(err);
    }
}));
//maual signin route
router.get('/sign-in', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (email && password) {
            let checkExistingProfile = yield index_1.default.admin.findFirst({
                where: {
                    email,
                },
            });
            if (checkExistingProfile === null) {
                checkExistingProfile = yield index_1.default.superAdmin.findFirst({
                    where: {
                        email,
                    },
                });
            }
            if (checkExistingProfile) {
                if (bcrypt_1.default.compareSync(password, checkExistingProfile.password)) {
                    const token = jsonwebtoken_1.default.sign({ profileId: checkExistingProfile.id }, process.env.JWT_SECRET || 'nope');
                    res.cookie('Authorisation', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                    });
                    console.log(res.cookie);
                    res
                        .status(200)
                        .json({ access_token: token });
                }
                else {
                    res.status(400).json({ message: 'wrong passord' });
                }
            }
            else {
                res.status(409).json({ message: 'profile not found' });
            }
        }
    }
    catch (err) {
        res.send(err);
    }
}));
//signin through google id
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_AUTH_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
    callbackURL: `http://localhost:8000/auth/google/callback`,
}, (accessToken, refreshToken, profile, cb) => {
    return cb(null, profile);
}));
router.get('/', (req, res) => {
    res.send(process.env.GOOGLE_AUTH_CLIENT_SECRET);
});
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user || null));
