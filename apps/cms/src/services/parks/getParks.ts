import type { ParkSearchFilters } from '@parksplash/shared';
import type { Payload } from 'payload';
import { mapParkCard, mapParkDetail } from './mapParkDoc';

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceMiles = (
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number }
) => {
  const earthRadiusMiles = 3958.8;
  const dLatitude = toRadians(right.latitude - left.latitude);
  const dLongitude = toRadians(right.longitude - left.longitude);
  const latitudeA = toRadians(left.latitude);
  const latitudeB = toRadians(right.latitude);
  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2);

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getParks = async (payload: Payload, filters: ParkSearchFilters = {}) => {
  const result = await payload.find({
    collection: 'parks',
    depth: 1,
    limit: 1000
  });

  let parks = result.docs.map((doc) => mapParkCard(doc as never));

  if (filters.coolDown) {
    parks = parks.filter((park) => park.coolDownCategory !== 'none');
  }

  if (filters.hasPool) {
    parks = parks.filter((park) => park.hasPool);
  }

  if (filters.hasSplashPad) {
    parks = parks.filter((park) => park.hasSplashPad);
  }

  if (filters.amenityKeys?.length) {
    parks = parks.filter((park) => filters.amenityKeys?.every((key) => park.amenityKeys.includes(key)));
  }

  if (filters.nearMe) {
    parks = parks
      .map((park) => ({
        ...park,
        distanceMiles: distanceMiles(filters.nearMe!, park.location)
      }))
      .filter((park) => (filters.nearMe?.radiusMiles ? park.distanceMiles! <= filters.nearMe.radiusMiles : true));

    if (filters.sortByDistance) {
      parks.sort((left, right) => (left.distanceMiles ?? 0) - (right.distanceMiles ?? 0));
    }
  }

  return parks;
};

export const getParkBySlug = async (payload: Payload, slug: string) => {
  const parksResult = await payload.find({
    collection: 'parks',
    where: {
      slug: {
        equals: slug
      }
    },
    depth: 1,
    limit: 1
  });

  const park = parksResult.docs[0];

  if (!park) {
    return null;
  }

  const [comments, checkIns, reports] = await Promise.all([
    payload.find({
      collection: 'parkComments',
      where: { park: { equals: park.id } },
      sort: '-createdAt',
      depth: 1,
      limit: 25
    }),
    payload.find({
      collection: 'parkCheckIns',
      where: { and: [{ park: { equals: park.id } }, { active: { equals: true } }] },
      sort: '-createdAt',
      depth: 1,
      limit: 25
    }),
    payload.find({
      collection: 'parkReports',
      where: { park: { equals: park.id } },
      sort: '-createdAt',
      depth: 1,
      limit: 50
    })
  ]);

  return mapParkDetail(
    park as never,
    comments.docs as never[],
    checkIns.docs as never[],
    reports.docs as never[]
  );
};
