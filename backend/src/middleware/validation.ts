import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { updatePropertySchema } from '../schema/property.schema.js';

export const validatePropertyData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updatePropertySchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};
