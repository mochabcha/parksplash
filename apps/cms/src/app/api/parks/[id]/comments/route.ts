import { getPayload } from 'payload';
import { createCmsPayloadRequest } from '../../../../../lib/payloadRequest';
import config from '../../../../../payload.config';
import { requireUser } from '../../../../../lib/auth';
import { handleOptions, jsonWithCors } from '../../../../../lib/http';
import { checkRateLimit } from '../../../../../lib/rateLimit';
import { containsBlockedLanguage } from '../../../../../lib/profanity';

export function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await createCmsPayloadRequest(request);
  const user = requireUser(payloadRequest, request);
  const body = await request.json();

  if (!checkRateLimit(`comment:${user.id}`, 6, 60_000)) {
    return jsonWithCors(request, { error: 'Rate limit exceeded.' }, { status: 429 });
  }

  if (!body.body || containsBlockedLanguage(String(body.body))) {
    return jsonWithCors(request, { error: 'Comment rejected.' }, { status: 400 });
  }

  const created = await payload.create({
    collection: 'parkComments',
    data: {
      park: body.parkId,
      user: user.id,
      body: String(body.body)
    }
  });

  return jsonWithCors(request, created, { status: 201 });
}
