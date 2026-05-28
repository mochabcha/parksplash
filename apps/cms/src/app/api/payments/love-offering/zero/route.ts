import { getPayload } from 'payload';
import config from '../../../../../payload.config';
import { sendThankYouEmail } from '../../../../../services/email/sendThankYouEmail';

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await payload.createPayloadRequest({ request });
  const body = await request.json();
  const created = await payload.create({
    collection: 'loveOfferings',
    data: {
      email: body.email,
      amount: 0,
      source: body.source,
      park: body.parkId,
      user: payloadRequest.user?.id,
      status: 'zero-choice'
    }
  });

  if (payloadRequest.user?.id) {
    await payload.update({
      collection: 'users',
      id: payloadRequest.user.id,
      data: {
        donationGateUnlocked: true
      }
    });
  }

  await sendThankYouEmail({
    email: String(body.email),
    amount: 0
  });

  return Response.json(created, { status: 201 });
}
