import { getPayload } from 'payload';
import { createCmsPayloadRequest } from '../../../../../lib/payloadRequest';
import config from '../../../../../payload.config';
import { requireUser } from '../../../../../lib/auth';
import { handleOptions, jsonWithCors } from '../../../../../lib/http';
import { checkRateLimit } from '../../../../../lib/rateLimit';

export function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await createCmsPayloadRequest(request);
  const user = requireUser(payloadRequest, request);
  const body = await request.json();

  if (!checkRateLimit(`checkin:${user.id}`, 6, 60_000)) {
    return jsonWithCors(request, { error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const existing = await payload.find({
    collection: 'parkCheckIns',
    where: {
      and: [{ park: { equals: body.parkId } }, { user: { equals: user.id } }, { active: { equals: true } }]
    },
    limit: 1
  });

  if (existing.docs[0]) {
    return jsonWithCors(request, { error: 'You are already checked in at this park.' }, { status: 409 });
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

  return jsonWithCors(request, created, { status: 201 });
}
