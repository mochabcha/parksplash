import type {
  DailyHours,
  LessonsAccess,
  OpeningPlan,
  PoolStatus,
  SiteType,
  SplashPadAccess,
} from '../pools/pool.types';

export interface ParkAmenityDefinition {
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

export interface ParkViewModel extends ParkRecord {
  amenityDefinitions: ParkAmenityDefinition[];
  primaryAmenities: ParkAmenityDefinition[];
  hasPool: boolean;
  hasSplashPad: boolean;
  kindLabel: string;
  hoursSummary: string;
  browseSummary: string;
  poolDetails?: ParkPoolDetails;
}

export interface AmenityFilterOption extends ParkAmenityDefinition {
  count: number;
}
