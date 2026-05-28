import { getPayload } from 'payload';
import { handleOptions, jsonWithCors } from '../../../lib/http';
import config from '../../../payload.config';
import { getParks } from '../../../services/parks/getParks';

export function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = await getPayload({ config });
  const parks = await getParks(payload, {
    coolDown: searchParams.get('coolDown') === 'true',
    hasPool: searchParams.get('hasPool') === 'true',
    hasSplashPad: searchParams.get('hasSplashPad') === 'true',
    sortByDistance: searchParams.get('sortByDistance') === 'true',
    amenityKeys: searchParams.getAll('amenityKey'),
    nearMe:
      searchParams.get('latitude') && searchParams.get('longitude')
        ? {
            latitude: Number(searchParams.get('latitude')),
            longitude: Number(searchParams.get('longitude')),
            radiusMiles: searchParams.get('radiusMiles') ? Number(searchParams.get('radiusMiles')) : undefined
          }
        : undefined
  });

  return jsonWithCors(request, parks);
}
