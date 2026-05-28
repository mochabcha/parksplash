import { getPayload } from 'payload';
import config from '../../../../../payload.config';
import { requireUser } from '../../../../../lib/auth';
import { checkRateLimit } from '../../../../../lib/rateLimit';
import { containsBlockedLanguage } from '../../../../../lib/profanity';

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await payload.createPayloadRequest({ request });
  const user = requireUser(payloadRequest);
  const body = await request.json();

  if (!checkRateLimit(`comment:${user.id}`, 6, 60_000)) {
    return Response.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  if (!body.body || containsBlockedLanguage(String(body.body))) {
    return Response.json({ error: 'Comment rejected.' }, { status: 400 });
  }

  const created = await payload.create({
    collection: 'parkComments',
    data: {
      park: body.parkId,
      user: user.id,
      body: String(body.body)
    }
  });

  return Response.json(created, { status: 201 });
}
