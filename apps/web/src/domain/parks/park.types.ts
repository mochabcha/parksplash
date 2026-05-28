import type { ParkCheckInDto, ParkCommentDto, ParkReportSummaryDto } from '@parksplash/shared';
import type {
  DailyHours,
  LessonsAccess,
  OpeningPlan,
  PoolStatus,
  SiteType,
  SplashPadAccess
} from '../pools/pool.types';

export interface ParkAmenityDefinition {
  id?: string;
  key: string;
  label: string;
  sourceIconUrl: string;
}

export interface ParkPoolOverlayRecord {
  source: 'pool-list' | 'parks-list';
  openingPlan?: OpeningPlan;
  lessons?: LessonsAccess;
  splashPad?: SplashPadAccess;
  siteType?: SiteType;
}

export interface ParkRecord {
  id: string;
  name: string;
  address: string;
  hours: string;
  detailPath: string;
  detailUrl: string;
  sourceImageUrl: string;
  detailImageUrl: string;
  localImagePath: string;
  mapQuery: string;
  description: string;
  amenityKeys: string[];
  amenities: string[];
  isStandalonePoolSite: boolean;
  poolOverlay: ParkPoolOverlayRecord | null;
  latitude: number;
  longitude: number;
  geocodeLabel: string;
}

export interface ParkPoolDetails {
  todayHours: string;
  nextWindow: string;
  seasonLabel: string;
  status: PoolStatus;
  amenities: string[];
  weeklyHours: DailyHours[];
  lessonsSummary: string;
  splashPadSummary: string;
  note?: string;
}

export interface ParkViewModel {
  id: string;
  slug: string;
  name: string;
  address: string;
  hours?: string;
  detailUrl: string;
  localImagePath: string;
  mapQuery: string;
  kindLabel: string;
  browseSummary: string;
  hoursSummary: string;
  hasPool: boolean;
  hasSplashPad: boolean;
  coolDownCategory: 'pool' | 'splash-pad' | 'both' | 'none';
  amenityKeys: string[];
  amenityDefinitions: ParkAmenityDefinition[];
  primaryAmenities: ParkAmenityDefinition[];
  location: {
    latitude: number;
    longitude: number;
  };
  latitude: number;
  longitude: number;
  description: string;
  poolDetails?: ParkPoolDetails;
  distanceMiles?: number;
  reportSummary: ParkReportSummaryDto;
  comments: ParkCommentDto[];
  checkIns: {
    totalActive: number;
    latest: ParkCheckInDto[];
  };
}

export interface AmenityFilterOption extends ParkAmenityDefinition {
  count: number;
}

export type ParkCatalogItem = Pick<
  ParkViewModel,
  | 'id'
  | 'slug'
  | 'name'
  | 'address'
  | 'detailUrl'
  | 'localImagePath'
  | 'mapQuery'
  | 'kindLabel'
  | 'browseSummary'
  | 'hoursSummary'
  | 'hasPool'
  | 'hasSplashPad'
  | 'coolDownCategory'
  | 'amenityKeys'
  | 'amenityDefinitions'
  | 'location'
  | 'latitude'
  | 'longitude'
  | 'distanceMiles'
>;
