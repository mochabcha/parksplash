import type {
  AmenityDefinitionDto,
  ParkCardDto,
  ParkCheckInSummaryDto,
  ParkCommentDto,
  ParkDetailDto,
  ParkReportSummaryDto
} from '@parksplash/shared';
import { cmsEnv } from '../../lib/env';

type RawRecord = Record<string, unknown>;

const asText = (value: unknown) => (typeof value === 'string' ? value : '');
const asBoolean = (value: unknown) => Boolean(value);
const asNumber = (value: unknown) => (typeof value === 'number' ? value : 0);


const joinUrl = (base: string, path: string) => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

const resolveMediaUrl = (media: RawRecord | undefined) => {
  const filename = asText(media?.filename);

  if (cmsEnv.assetBaseUrl && filename) {
    return joinUrl(cmsEnv.assetBaseUrl, encodeURIComponent(filename));
  }

  return asText(media?.url);
};


export const mapAmenity = (amenity: RawRecord): AmenityDefinitionDto => ({
  id: asText(amenity.id),
  key: asText(amenity.key),
  label: asText(amenity.label),
  sourceIconUrl: asText(amenity.sourceIconUrl)
});

export const mapParkCard = (doc: RawRecord): ParkCardDto => {
  const image = (doc.image as RawRecord | undefined) ?? undefined;
  const location = (doc.geoOverride as RawRecord | undefined)?.latitude
    ? (doc.geoOverride as RawRecord)
    : ((doc.location as RawRecord | undefined) ?? {});

  const amenityKeys = Array.isArray(doc.amenityKeys)
    ? doc.amenityKeys.map((entry) => asText((entry as RawRecord).key)).filter(Boolean)
    : [];

  return {
    id: asText(doc.id),
    slug: asText(doc.slug),
    name: asText(doc.name),
    address: asText(doc.address),
    mapQuery: asText(doc.mapQuery) || asText(doc.address),
    detailUrl: asText(doc.detailUrl),
    imageUrl: resolveMediaUrl(image),
    kindLabel: asBoolean(doc.hasPool) ? 'Park with pool' : 'Park',
    browseSummary: asText(doc.hours) || 'Hours not listed',
    hoursSummary: asText(doc.hours) || 'Hours not listed',
    hasPool: asBoolean(doc.hasPool),
    hasSplashPad: asBoolean(doc.hasSplashPad),
    coolDownCategory: (asText(doc.coolDownCategory) as ParkCardDto['coolDownCategory']) || 'none',
    amenityKeys,
    amenityDefinitions: Array.isArray(doc.amenityRefs)
      ? doc.amenityRefs.map((amenity) => mapAmenity(amenity as RawRecord))
      : [],
    location: {
      latitude: asNumber(location.latitude),
      longitude: asNumber(location.longitude)
    },
    poolDetails: undefined
  };
};

export const mapComment = (doc: RawRecord): ParkCommentDto => ({
  id: asText(doc.id),
  parkId: asText((doc.park as RawRecord | undefined)?.id) || asText(doc.park),
  userId: asText((doc.user as RawRecord | undefined)?.id) || asText(doc.user),
  displayName: asText(((doc.user as RawRecord | undefined)?.displayName as string | undefined) ?? 'Parksplash guest'),
  body: asText(doc.body),
  createdAt: asText(doc.createdAt)
});

export const mapCheckInSummary = (docs: RawRecord[]): ParkCheckInSummaryDto => ({
  totalActive: docs.length,
  latest: docs.slice(0, 8).map((doc) => ({
    id: asText(doc.id),
    parkId: asText((doc.park as RawRecord | undefined)?.id) || asText(doc.park),
    userId: asText((doc.user as RawRecord | undefined)?.id) || asText(doc.user),
    displayName: asText(((doc.user as RawRecord | undefined)?.displayName as string | undefined) ?? 'Parksplash guest'),
    note: asText(doc.note) || undefined,
    createdAt: asText(doc.createdAt)
  }))
});

export const summarizeReports = (docs: RawRecord[]): ParkReportSummaryDto => ({
  crowdedness: (asText(docs[0]?.crowdednessLevel) as ParkReportSummaryDto['crowdedness']) || 'unknown',
  cleanliness: (asText(docs[0]?.cleanlinessRating) as ParkReportSummaryDto['cleanliness']) || 'unknown',
  safetyFlags: docs.map((doc) => asText(doc.safetyConcern)).filter(Boolean) as ParkReportSummaryDto['safetyFlags'],
  weatherFlags: docs.map((doc) => asText(doc.weatherIssue)).filter(Boolean) as ParkReportSummaryDto['weatherFlags'],
  totalReports: docs.length,
  updatedAt: asText(docs[0]?.createdAt) || undefined
});

export const mapParkDetail = (
  park: RawRecord,
  comments: RawRecord[],
  checkIns: RawRecord[],
  reports: RawRecord[]
): ParkDetailDto => ({
  ...mapParkCard(park),
  description: asText(park.description),
  facilityDetails: {
    poolDepthRanges: asText((park.facilityDetails as RawRecord | undefined)?.poolDepthRanges) || undefined,
    kidFriendlyNotes: asText((park.facilityDetails as RawRecord | undefined)?.kidFriendlyNotes) || undefined,
    accessibilityFeatures: Array.isArray((park.facilityDetails as RawRecord | undefined)?.accessibilityFeatures)
      ? ((park.facilityDetails as RawRecord).accessibilityFeatures as RawRecord[]).map((entry) => asText(entry.feature))
      : [],
    accessibleRamp: asBoolean((park.facilityDetails as RawRecord | undefined)?.accessibleRamp),
    hasLifeguards: asBoolean((park.facilityDetails as RawRecord | undefined)?.hasLifeguards)
  },
  reportSummary: summarizeReports(reports),
  comments: comments.map(mapComment),
  checkIns: mapCheckInSummary(checkIns)
});
