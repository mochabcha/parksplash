import Stripe from 'stripe';
import { cmsEnv } from './env';

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  if (!cmsEnv.stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(cmsEnv.stripeSecretKey, {
      apiVersion: '2025-04-30.basil'
    });
  }

  return stripeClient;
};
