import { Request, Response } from 'express';
import { BaseController } from './base.controllers.js';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
// Schema for page validation
const pageSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  templateType: z.enum(['DOCUMENT', 'LOCATION', 'PORTFOLIO', 'CONTACT']),
  description: z.string().optional(),
  jsonData: z.object({}).passthrough(),
  isPublic: z.boolean().default(false)
});

export class PageBuilderController extends BaseController {
  // Get all pages for the authenticated user
  async getPages(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { templateType } = req.query;
      
      // Build the where clause
      const where: any = { userId };
      
      if (templateType) {
        where.templateType = templateType;
      }
      
      const pages = await prisma.page.findMany({
        where,
        orderBy: { updatedAt: 'desc' }
      });
      
      return pages;
    });
  }

  // Get page by ID
  async getPageById(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const page = await prisma.page.findFirst({
        where: { id, userId }
      });
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      return page;
    });
  }

  // Create a new page
  async createPage(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const validation = pageSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid page data', 
          errors: validation.error.format() 
        });
      }
      
      const { templateType, title, description, jsonData, isPublic } = validation.data;
      
      // Check if the user already has a page with this template type
      const existingPageWithType = await prisma.page.findFirst({
        where: { userId, templateType }
      });
      
      if (existingPageWithType) {
        return res.status(400).json({ 
          message: 'You already have a page with this template type', 
          existingPageId: existingPageWithType.id 
        });
      }
      
      // Generate slug if not provided
      let slug = validation.data.slug;
      
      const page = await prisma.page.create({
        data: {
          userId,
          title,
          slug: slug || '',
          templateType,
          description,
          jsonData,
          isPublic,
          lastPublishedAt: isPublic ? new Date() : null
        }
      });
      
      return page;
    });
  }

  // Update page
  async updatePage(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if page exists and belongs to user
      const existingPage = await prisma.page.findFirst({
        where: { id, userId }
      });
      
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const validation = pageSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid page data', 
          errors: validation.error.format() 
        });
      }
      
      const { title, templateType, description, jsonData, isPublic } = validation.data;
      
      // Generate slug if not provided
      let slug = validation.data.slug;
      if (!slug) {
        slug = existingPage.slug; // Keep existing slug if not provided
      } else if (slug !== existingPage.slug) {
        // Check if new slug is unique
        const slugExists = await prisma.page.findFirst({
          where: { 
            slug,
            id: { not: id } // Exclude current page
          }
        });
        
        if (slugExists) {
          // Append timestamp to make unique
          slug = `${slug}-${Date.now()}`;
        }
      }
      
      // Update lastPublishedAt if making public for the first time
      const lastPublishedAt = (!existingPage.isPublic && isPublic) 
        ? new Date() 
        : existingPage.lastPublishedAt;
      
      const page = await prisma.page.update({
        where: { id },
        data: {
          title,
          slug,
          templateType,
          description,
          jsonData,
          isPublic,
          lastPublishedAt
        }
      });
      
      return page;
    });
  }

  // Delete page
  async deletePage(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if page exists and belongs to user
      const existingPage = await prisma.page.findFirst({
        where: { id, userId }
      });
      
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      await prisma.page.delete({
        where: { id }
      });
      
      return { message: 'Page deleted successfully' };
    });
  }

  // Check if slug is unique
  async checkSlug(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { slug, pageId } = req.body;
      
      if (!slug) {
        return res.status(400).json({ message: 'Slug is required' });
      }
      
      // Build where clause
      const where: any = { slug };
      
      // If pageId is provided, exclude that page
      if (pageId) {
        where.id = { not: pageId };
      }
      
      const existingPage = await prisma.page.findFirst({ where });
      
      return { 
        isUnique: !existingPage,
        suggestedSlug: existingPage ? `${slug}-${Date.now()}` : slug
      };
    });
  }

  // Publish page
  async publishPage(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if page exists and belongs to user
      const existingPage = await prisma.page.findFirst({
        where: { id, userId }
      });
      
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      const page = await prisma.page.update({
        where: { id },
        data: {
          isPublic: true,
          lastPublishedAt: new Date()
        }
      });
      
      return page;
    });
  }
}

// Public controller for accessing public pages
export class PublicPageController extends BaseController {
  // Get public page by slug
  async getPageBySlug(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { slug } = req.params;
      
      const page = await prisma.page.findFirst({
        where: { slug, isPublic: true }
      });
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      // Increment view count
      await prisma.page.update({
        where: { id: page.id },
        data: { viewCount: { increment: 1 } }
      });
      
      // Return only necessary data for public consumption
      return {
        title: page.title,
        description: page.description,
        templateType: page.templateType,
        jsonData: page.jsonData
      };
    });
  }
}

export const pageBuilderController = new PageBuilderController();
export const publicPageController = new PublicPageController(); 