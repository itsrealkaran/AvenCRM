import express, { Request, Response, NextFunction, Router } from 'express';
import Stripe from 'stripe';
import { AuthenticatedRequest, protect } from '../middleware/auth.js';
import { verifyAdmin } from '../lib/verifyUser.js';
import { prisma } from '../lib/prisma.js';
import { PlanTier, User } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

const router: Router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //@ts-ignore
  apiVersion: '2024-11-20.acacia'
});

// Webhook handler for Stripe events
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'No Stripe signature found' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await handleSuccessfulSubscription(session);
          break;
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCancellation(subscription);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  }
);

// Protect all routes
router.use(protect);
// router.use(verifyAdmin);

// Create a checkout session
router.post('/create-checkout-session', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, planName, price } = req.body;
    const planType = planId as PlanTier;

    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: `Subscription to ${planName} plan`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/admin/subscription?canceled=true`,
      metadata: {
        planType,
        userId,
        companyId
      },//@ts-ignore
      customer_email: req.user.email,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
});

// Retrieve session
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({ session });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Error retrieving session' });
  }
});

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  
  // Log the metadata for debugging

  
  if (!metadata.planType || !metadata.userId || !metadata.companyId) {
    console.error('Missing metadata:', {
      planType: metadata.planType,
      userId: metadata.userId,
      companyId: metadata.companyId
    });
    throw new Error('Missing metadata in session');
  }

  try {
    // Get payment intent details if available
    let receiptUrl: string | undefined;
    if (session.payment_intent) {
      const charges = await stripe.charges.list({
        payment_intent: session.payment_intent as string,
        limit: 1,
      });
      receiptUrl = charges.data[0]?.receipt_url ?? undefined;
    }

    // Create a subscription transaction record
     const transaction = await prisma.payments.create({
      data: {
        amount: session.amount_total! / 100,
        companyId: metadata.companyId,
        planType: metadata.planType as PlanTier,
        isSuccessfull: true,
        transactionMethod: 'STRIPE',
        receiptUrl,
      },
    });

    // Update company subscription details
    await prisma.company.update({
      where: { id: metadata.companyId },
      data: {
        planStart: new Date(),
        planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const metadata = subscription.metadata;

  if (!metadata?.companyId) {
    throw new Error('Company ID not found in subscription metadata');
  }

  try {
    // Create a cancellation transaction record
    await prisma.transaction.create({
      data: {
        amount: 0,
        type: 'SUBSCRIPTION',
        company: {
          connect: { id: metadata.companyId }
        },
        agent: {
          connect: { id: metadata.userId }
        },
        planType: metadata.planType as PlanTier,
        isVerified: true,
        transactionMethod: 'STRIPE',
        receiptUrl: null,
      },
    });

    // Update company subscription details
    await prisma.company.update({
      where: { id: metadata.companyId },
      data: {
        planEnd: new Date(), // End subscription immediately
      },
    });
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

export default router;
