/**
 * Stripe server-side utilities.
 * Used by API routes only — never import this in client components.
 */

import Stripe from 'stripe'

/** Lazily initialized Stripe client — avoids crashing at build time when env vars aren't set. */
let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(key, { typescript: true })
  }
  return _stripe
}

/**
 * Create a Stripe Checkout Session for a subscription.
 * Redirects the user to Stripe's hosted checkout page.
 */
export async function createStripeCheckoutSession(params: {
  priceId: string
  userId: string
  userEmail: string
  planId: string
  tier: string
  billingPeriod: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const session = await getStripeClient().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    customer_email: params.userEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      user_id: params.userId,
      plan_id: params.planId,
      tier: params.tier,
      billing_period: params.billingPeriod,
    },
    subscription_data: {
      metadata: {
        user_id: params.userId,
        plan_id: params.planId,
        tier: params.tier,
        billing_period: params.billingPeriod,
      },
    },
  })

  return session
}

/** Cancel a Stripe subscription at period end. */
export async function cancelStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/** Immediately cancel a Stripe subscription. */
export async function cancelStripeSubscriptionImmediately(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.cancel(subscriptionId)
}

/** Get a Stripe subscription by ID. */
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.retrieve(subscriptionId)
}

/** Construct and verify a Stripe webhook event. */
export function constructStripeEvent(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret)
}
