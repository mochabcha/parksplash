import type { ParkCardDto, ParkDetailDto } from '@parksplash/shared';
import { appConfig } from '../../config/appConfig';
import { getParkDirectory } from './parkDirectory';
import type { ParkViewModel } from './park.types';

const fromFallback = (): ParkViewModel[] => getParkDirectory();

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${appConfig.cmsUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const toViewModel = (park: ParkCardDto | ParkDetailDto): ParkViewModel => ({
  id: park.id,
  slug: park.slug,
  name: park.name,
  address: park.address,
  detailUrl: park.detailUrl,
  localImagePath: park.localImagePath,
  mapQuery: park.mapQuery,
  kindLabel: park.kindLabel,
  browseSummary: park.browseSummary,
  hoursSummary: park.hoursSummary,
  hasPool: park.hasPool,
  hasSplashPad: park.hasSplashPad,
  coolDownCategory: park.coolDownCategory,
  amenityKeys: park.amenityKeys,
  amenityDefinitions: park.amenityDefinitions,
  primaryAmenities: park.amenityDefinitions.slice(0, 8),
  location: park.location,
  latitude: park.location.latitude,
  longitude: park.location.longitude,
  hours: undefined,
  poolDetails: park.poolDetails
    ? {
        todayHours: park.poolDetails.todayHours,
        nextWindow: park.poolDetails.nextWindow,
        seasonLabel: park.poolDetails.seasonLabel,
        status: park.poolDetails.status as never,
        amenities: park.poolDetails.amenities,
        weeklyHours: park.poolDetails.weeklyHours.map((row) => ({
          label: row.day,
          hours: row.hours
        })) as never,
        lessonsSummary: park.poolDetails.lessonsSummary,
        splashPadSummary: park.poolDetails.splashPadSummary,
        note: park.poolDetails.note
      }
    : undefined,
  description: 'description' in park ? park.description : '',
  reportSummary:
    'reportSummary' in park
      ? park.reportSummary
      : {
          crowdedness: 'unknown',
          cleanliness: 'unknown',
          safetyFlags: [],
          weatherFlags: [],
          totalReports: 0
        },
  comments: 'comments' in park ? park.comments : [],
  checkIns:
    'checkIns' in park
      ? park.checkIns
      : {
          totalActive: 0,
          latest: []
        }
});

export const loadParkCatalog = async () => {
  try {
    const parks = await request<ParkCardDto[]>('/api/parks');
    return parks.map(toViewModel);
  } catch {
    return fromFallback();
  }
};

export const loadParkDetail = async (slug: string) => {
  try {
    const park = await request<ParkDetailDto>(`/api/parks/${slug}`);
    return toViewModel(park);
  } catch {
    return fromFallback().find((entry) => entry.slug === slug);
  }
};

export const submitReport = async (parkId: string, payload: Record<string, unknown>) =>
  request(`/api/parks/${parkId}/reports`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const submitComment = async (parkId: string, payload: Record<string, unknown>) =>
  request(`/api/parks/${parkId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const submitCheckIn = async (parkId: string, payload: Record<string, unknown>) =>
  request(`/api/parks/${parkId}/check-ins`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const createLoveOfferingSession = async (payload: Record<string, unknown>) =>
  request<{ checkoutUrl?: string; offeringId: string }>('/api/payments/love-offering/session', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const submitZeroLoveOffering = async (payload: Record<string, unknown>) =>
  request('/api/payments/love-offering/zero', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
