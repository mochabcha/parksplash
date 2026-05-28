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

  if (!checkRateLimit(`report:${user.id}`, 10, 60_000)) {
    return jsonWithCors(request, { error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const created = await payload.create({
    collection: 'parkReports',
    data: {
      park: body.parkId,
      user: user.id,
      reportType: body.reportType,
      cleanlinessFacility: body.cleanlinessFacility,
      cleanlinessRating: body.cleanlinessRating,
      safetyConcern: body.safetyConcern,
      weatherIssue: body.weatherIssue,
      crowdednessLevel: body.crowdednessLevel,
      staffSupportSignal: body.staffSupportSignal,
      kidFriendlySignal: body.kidFriendlySignal,
      submittedWeather: body.submittedWeather,
      note: body.note
    }
  });

  return jsonWithCors(request, created, { status: 201 });
}
