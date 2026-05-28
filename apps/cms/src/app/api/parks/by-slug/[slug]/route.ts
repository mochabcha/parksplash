import { getPayload } from 'payload';
import { handleOptions, jsonWithCors } from '../../../../../lib/http';
import config from '../../../../../payload.config';
import { getParkBySlug } from '../../../../../services/parks/getParks';

export function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const payload = await getPayload({ config });
  const { slug } = await params;
  const park = await getParkBySlug(payload, slug);

  if (!park) {
    return jsonWithCors(request, { error: 'Park not found.' }, { status: 404 });
  }

  return jsonWithCors(request, park);
}
