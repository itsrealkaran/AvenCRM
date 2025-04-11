import express, { Request, Response, NextFunction, Router } from 'express';
import Stripe from 'stripe';
import { AuthenticatedRequest, protect } from '../middleware/auth.js';
import { verifyAdmin } from '../lib/verifyUser.js';
import { prisma } from '../lib/prisma.js';
import { BillingFrequency, PlanTier, PlanType, User } from '@prisma/client';
import { decode } from 'jsonwebtoken';

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
    console.log('sig', sig);
    if (!sig) {
      return res.status(400).json({ error: 'No Stripe signature found' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log('event', event);
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
// router.use(protect);
// router.use(verifyAdmin);

// Create a checkout session
router.post('/create-checkout-session', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planId, planName, accountType, billingFrequency, currency, userCount, email } = req.body;
    const planType = planId.toUpperCase() as PlanTier;

    let token = req.cookies.Authorization;
    
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = decode(token);
      if (decoded && typeof decoded === 'object' && 'id' in decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
        if (user) {
          req.user = {
            id: user.id,
            role: user.role,
            email: user.email,
            companyId: user.companyId || '',
            teamId: user.teamId || ''
          };
        }
      }
    }

    const userId = req.user?.id !== undefined ? req.user.id : req.body.userId;
    const companyId = req.user?.companyId !== undefined ? req.user.companyId : req.body.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const plan = await prisma.plan.findUnique({
      where: {
        name: planId.toUpperCase()
      }
    });

    if (!plan) {
      return res.status(401).json({ error: 'Plan not found' });
    }

    const priceJson: any = typeof plan.price === "string" ? JSON.parse(plan.price as string) : plan.price;
    
    // Verify priceJson is an object
    if (typeof priceJson !== 'object' || priceJson === null) {
      return res.status(400).json({ error: 'Invalid price structure' });
    }

    // Safely access the company property
    const companyPricing = priceJson.company;
    
    const account = accountType === 'company' ? companyPricing : priceJson.individual;
    if (!account) {
      return res.status(400).json({ error: `Invalid account type: ${accountType}` });
    }

    const frequency = billingFrequency === 'monthly' ? account.monthly : account.annually;
    const currencySymbol = currency === 'USD' ? 'USD' : currency === 'CAD' ? 'CAD' : currency === 'AED' ? 'AED' : null;

    if (!currencySymbol) {
      return res.status(401).json({ error: 'Invalid currency' });
    }

    let totalAmount = frequency[currencySymbol] * Number(userCount);
    if (billingFrequency === 'annually') {
      totalAmount = totalAmount * 12;
    }

    if (!totalAmount) {
      return res.status(401).json({ error: 'Price not found for selected currency' });
    }
    const customerEmail = req.user?.email === undefined ? email : req.user?.email;
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currencySymbol.toLowerCase(),
            product_data: {
              name: planName,
              description: `Subscription to ${planId} plan`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
            recurring: {
              interval: billingFrequency === 'monthly' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/admin/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/admin/subscription?canceled=true`,
      metadata: {
        planId,
        userId,
        companyId,
        billingFrequency,
        accountType,
      },//@ts-ignore
      customer_email: customerEmail,
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
  
  if (!metadata.planId || !metadata.userId || !metadata.companyId || !metadata.billingFrequency) {
    console.error('Missing metadata:', {
      userId: metadata.userId,
      companyId: metadata.companyId,
      billingFrequency: metadata.billingFrequency
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
    await prisma.$transaction(async (tx) => {
      if(!session.amount_total) {
        throw new Error('Amount total not found in session');
      }
      const payment = await tx.payments.create({
        data: {
          amount: session.amount_total / 100,
          companyId: metadata.companyId,
          planType: metadata.planId.toUpperCase() as PlanTier,
          isSuccessfull: true,
          transactionMethod: 'STRIPE',
          receiptUrl,
          billingFrequency: metadata.billingFrequency
        },
      })
      const timePeriod = metadata.billingFrequency === 'monthly' ? 30 : 365;
      await tx.company.update({
        where: { id: metadata.companyId },
        data: {
          planStart: new Date(),
          planEnd: new Date(Date.now() + timePeriod * 24 * 60 * 60 * 1000),
          planName: metadata.planId.toUpperCase() as PlanTier,
          billingFrequency: metadata.billingFrequency as BillingFrequency,
          planType: metadata.accountType as PlanType || 'company',
        },
      });
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  // const customerId = subscription.customer as string;
  // const metadata = subscription.metadata;

  // if (!metadata?.companyId) {
  //   throw new Error('Company ID not found in subscription metadata');
  // }

  // try {
  //   // Create a cancellation transaction record
  //   await prisma.transaction.create({
  //     data: {
  //       amount: 0,
  //       company: {
  //         connect: { id: metadata.companyId }
  //       },
  //       agent: {
  //         connect: { id: metadata.userId }
  //       },
  //       transactionMethod: 'STRIPE',
  //       receiptUrl: null,
  //     },
  //   });

  //   // Update company subscription details
  //   await prisma.company.update({
  //     where: { id: metadata.companyId },
  //     data: {
  //       planEnd: new Date(), // End subscription immediately
  //     },
  //   });
  // } catch (error) {
  //   console.error('Error handling subscription cancellation:', error);
  //   throw error;
  // }
}

export default router;
