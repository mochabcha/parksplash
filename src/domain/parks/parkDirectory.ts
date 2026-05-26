import parkAmenities from '../../content/parks/amenities.generated.json';
import parkDirectory from '../../content/parks/parks.generated.json';
import { buildPoolViewModel } from '../pools/poolSeason';
import { resolveAmenityDefinition } from './parkAmenities';
import type {
  ParkAmenityDefinition,
  ParkPoolDetails,
  ParkRecord,
  ParkViewModel,
} from './park.types';

const typedParkDirectory = parkDirectory as ParkRecord[];
const typedAmenityDirectory = parkAmenities as ParkAmenityDefinition[];

const amenityMap = new Map(typedAmenityDirectory.map((amenity) => [amenity.key, amenity]));

const getKindLabel = (park: ParkRecord, hasPool: boolean) => {
  if (park.isStandalonePoolSite) {
    switch (park.poolOverlay?.siteType) {
      case 'school':
        return 'School pool';
      case 'aquatic-center':
        return 'Aquatic center';
      default:
        return 'Pool site';
    }
  }

  if (hasPool) {
    return 'Park with pool';
  }

  return 'Park';
};

const getPoolDetails = (park: ParkRecord, date: Date): ParkPoolDetails | undefined => {
  if (!park.poolOverlay?.openingPlan) {
    return undefined;
  }

  return buildPoolViewModel(
    {
      name: park.name,
      openingPlan: park.poolOverlay.openingPlan,
    },
    date,
  );
};

const buildBrowseSummary = (
  park: ParkRecord,
  primaryAmenities: ParkAmenityDefinition[],
  poolDetails: ParkPoolDetails | undefined,
  hasPool: boolean,
  hasSplashPad: boolean,
) => {
  const parts: string[] = [];

  if (poolDetails) {
    parts.push(poolDetails.status.accentLabel);
  } else if (park.hours) {
    parts.push(park.hours);
  }

  if (hasPool && !poolDetails) {
    parts.push('Pool listed');
  }

  if (hasSplashPad) {
    parts.push('Splash pad');
  }

  const amenitySummary = primaryAmenities
    .filter((amenity) => amenity.key !== 'swimmingpool' && amenity.key !== 'splashpad')
    .slice(0, 2)
    .map((amenity) => amenity.label)
    .join(' • ');

  if (amenitySummary) {
    parts.push(amenitySummary);
  }

  return parts.join(' • ');
};

export const getParkAmenityMap = () => amenityMap;

export const getParkDirectory = (date = new Date()): ParkViewModel[] =>
  typedParkDirectory.map((park) => {
    const amenityDefinitions = park.amenityKeys.map((key) => resolveAmenityDefinition(amenityMap, key));
    const primaryAmenities = amenityDefinitions.slice(0, 8);
    const hasPool = park.amenityKeys.includes('swimmingpool') || Boolean(park.poolOverlay);
    const hasSplashPad = park.amenityKeys.includes('splashpad');
    const poolDetails = getPoolDetails(park, date);
    const hoursSummary = poolDetails?.todayHours ?? park.hours ?? 'Hours not listed';

    return {
      ...park,
      amenityDefinitions,
      primaryAmenities,
      hasPool,
      hasSplashPad,
      kindLabel: getKindLabel(park, hasPool),
      hoursSummary,
      browseSummary: buildBrowseSummary(park, primaryAmenities, poolDetails, hasPool, hasSplashPad),
      poolDetails,
    };
  });
