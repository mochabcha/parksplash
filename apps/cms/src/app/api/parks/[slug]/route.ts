import { getPayload } from 'payload';
import config from '../../../../payload.config';
import { getParkBySlug } from '../../../../services/parks/getParks';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const payload = await getPayload({ config });
  const { slug } = await params;
  const park = await getParkBySlug(payload, slug);

  if (!park) {
    return Response.json({ error: 'Park not found.' }, { status: 404 });
  }

  return Response.json(park);
}
