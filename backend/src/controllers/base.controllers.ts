// src/controllers/base.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class BaseController {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  protected async handleRequest(
    req: Request,
    res: Response,
    operation: () => Promise<any>
  ) {
    try {
      const result = await operation();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Operation failed:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}