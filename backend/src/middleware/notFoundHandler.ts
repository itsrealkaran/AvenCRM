import type { Request, Response } from 'express';
import { AppError } from '../utils/appError.js';

export const notFoundHandler = (req: Request, _res: Response) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
};