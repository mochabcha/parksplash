import { getPayload } from 'payload';
import config from '../../../../../payload.config';
import { cmsEnv } from '../../../../../lib/env';
import { getStripe } from '../../../../../lib/stripe';

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await payload.createPayloadRequest({ request });
  const body = await request.json();
  const stripe = getStripe();

  if (!stripe) {
    return Response.json({ error: 'Stripe is not configured.' }, { status: 500 });
  }

  const amount = Number(body.amount);
  const isPreset = amount === 5 || amount === 10 || amount === 25 || amount === 50;
  const price = isPreset
    ? cmsEnv.stripePriceIds[amount as 5 | 10 | 25 | 50]
    : cmsEnv.stripePriceIds.custom;

  const offering = await payload.create({
    collection: 'loveOfferings',
    data: {
      email: body.email,
      amount,
      source: body.source,
      park: body.parkId,
      user: payloadRequest.user?.id,
      status: 'pending'
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: String(body.email),
    success_url: `${cmsEnv.publicWebUrl}/?loveOffering=success`,
    cancel_url: `${cmsEnv.publicWebUrl}/?loveOffering=cancelled`,
    line_items: isPreset
      ? [{ price, quantity: 1 }]
      : [
          {
            price,
            quantity: 1
          }
        ],
    metadata: {
      loveOfferingId: String(offering.id),
      source: String(body.source),
      parkId: String(body.parkId ?? '')
    }
  });

  await payload.update({
    collection: 'loveOfferings',
    id: offering.id,
    data: {
      stripeCheckoutSessionId: session.id
    }
  });

  return Response.json({
    checkoutUrl: session.url,
    offeringId: offering.id
  });
}
