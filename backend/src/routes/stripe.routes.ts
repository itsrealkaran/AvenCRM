import express, { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
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

const router = express.Router();
console.log(process.env.STRIPE_SECRET_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

// Protect all routes
// router.use(protect);
// router.use(verifyAdmin);

// Create a checkout session
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { planId, planName, price } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    // if (!userId || !companyId) {
    //   return res.status(401).json({ error: 'User not authenticated' });
    // }

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
      success_url: `${process.env.FRONTEND_URL}/admin/company/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/admin/company/subscription?canceled=true`,
      metadata: {
        planId: "planId",
        userId: "userId",
        companyI: "companyId"
      },//@ts-ignore
      customer_email: "req.user?.email.com",
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

// Webhook handler for Stripe events
router.post('/webhook', express.json({ type: 'application/json' }), async (req: Request, res: Response) => {
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
        // Update subscription status in your database
        await handleSuccessfulSubscription(session);
        break;
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellation
        await handleSubscriptionCancellation(subscription);
        break;
      // Add other event types as needed
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  const { planId, userId, companyId } = session.metadata || {};
  if (!planId || !userId || !companyId) {
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
    await prisma.transaction.create({
      data: {
        amount: session.amount_total! / 100, // Convert to dollars
        type: 'SUBSCRIPTION',
        company: {
          connect: { id: companyId }
        },
        agent: {
          connect: { id: userId }
        },
        planType: planId as PlanTier,
        isVerified: true,
        transactionMethod: 'STRIPE',
        receiptUrl,
      },
    });

    // Update company subscription details
    await prisma.company.update({
      where: { id: companyId },
      data: {
        plan: {
          connect: { id: planId }
        },
        planStart: new Date(),
        planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Store Stripe-specific details in a separate table if needed
    // You might want to create a new model for this in your schema
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
        planType: metadata.planId as PlanTier,
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