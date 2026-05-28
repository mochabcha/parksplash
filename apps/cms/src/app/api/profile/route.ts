import { getPayload } from 'payload';
import { createCmsPayloadRequest } from '../../../lib/payloadRequest';
import { handleOptions, jsonWithCors } from '../../../lib/http';
import config from '../../../payload.config';
import { requireUser } from '../../../lib/auth';

export function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await createCmsPayloadRequest(request);
  const user = requireUser(payloadRequest, request);

  return jsonWithCors(request, {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: Boolean(user._verified),
    locationConsent: user.locationConsent ?? 'unknown',
    donationGateUnlocked: Boolean(user.donationGateUnlocked)
  });
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config });
  const payloadRequest = await createCmsPayloadRequest(request);
  const user = requireUser(payloadRequest, request);
  const body = await request.json();
  const updated = await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      displayName: typeof body.displayName === 'string' ? body.displayName : user.displayName,
      locationConsent: body.locationConsent ?? user.locationConsent
    }
  });

  return jsonWithCors(request, updated);
}
