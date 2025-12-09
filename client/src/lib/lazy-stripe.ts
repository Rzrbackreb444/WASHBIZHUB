import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) => {
      const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (!key) {
        console.warn('[LazyStripe] Missing VITE_STRIPE_PUBLIC_KEY');
        return null;
      }
      return loadStripe(key);
    });
  }
  return stripePromise;
}

export function preloadStripe(): void {
  if (typeof window === 'undefined') return;
  
  requestIdleCallback?.(() => {
    getStripe();
  }) || setTimeout(() => getStripe(), 2000);
}

export async function createCheckoutSession(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not available');
  }
  
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw new Error(error.message);
  }
}
