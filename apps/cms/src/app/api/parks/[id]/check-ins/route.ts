import { getPayload } from 'payload';
import config from '../../../../../payload.config';
import { requireUser } from '../../../../../lib/auth';
import { checkRateLimit } from '../../../../../lib/rateLimit';

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await payload.createPayloadRequest({ request });
  const user = requireUser(payloadRequest);
  const body = await request.json();

  if (!checkRateLimit(`checkin:${user.id}`, 6, 60_000)) {
    return Response.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const existing = await payload.find({
    collection: 'parkCheckIns',
    where: {
      and: [{ park: { equals: body.parkId } }, { user: { equals: user.id } }, { active: { equals: true } }]
    },
    limit: 1
  });

  if (existing.docs[0]) {
    return Response.json({ error: 'You are already checked in at this park.' }, { status: 409 });
  }

  const created = await payload.create({
    collection: 'parkCheckIns',
    data: {
      park: body.parkId,
      user: user.id,
      note: typeof body.note === 'string' ? body.note : undefined,
      active: true
    }
  });

  return Response.json(created, { status: 201 });
}
