import { headers } from 'next/headers';
import { getPayload } from 'payload';
import config from '../../../../../payload.config';
import { cmsEnv } from '../../../../../lib/env';
import { handleOptions, jsonWithCors } from '../../../../../lib/http';
import { getStripe } from '../../../../../lib/stripe';
import { sendThankYouEmail } from '../../../../../services/email/sendThankYouEmail';

export function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function POST(request: Request) {
  const stripe = getStripe();

  if (!stripe || !cmsEnv.stripeWebhookSecret) {
    return jsonWithCors(request, { error: 'Stripe webhook is not configured.' }, { status: 500 });
  }

  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return jsonWithCors(request, { error: 'Missing stripe signature.' }, { status: 400 });
  }

  const event = stripe.webhooks.constructEvent(
    await request.text(),
    signature,
    cmsEnv.stripeWebhookSecret
  );

  if (event.type !== 'checkout.session.completed') {
    return jsonWithCors(request, { ok: true });
  }

  const session = event.data.object;
  const loveOfferingId = session.metadata?.loveOfferingId;

  if (!loveOfferingId) {
    return jsonWithCors(request, { ok: true });
  }

  const payload = await getPayload({ config });
  const updated = await payload.update({
    collection: 'loveOfferings',
    id: loveOfferingId,
    data: {
      status: 'paid'
    }
  });

  const relatedUserId =
    typeof updated.user === 'object' && updated.user && 'id' in updated.user
      ? String(updated.user.id)
      : typeof updated.user === 'string'
        ? updated.user
        : '';

  if (relatedUserId) {
    await payload.update({
      collection: 'users',
      id: relatedUserId,
      data: {
        donationGateUnlocked: true
      }
    });
  }

  await sendThankYouEmail({
    email: String(updated.email),
    amount: Number(updated.amount)
  });

  return jsonWithCors(request, { ok: true });
}
