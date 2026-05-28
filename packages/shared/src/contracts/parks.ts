import type { ParkCheckInSummaryDto } from './checkins';
import type { ParkCommentDto } from './comments';
import type { ParkReportSummaryDto } from './reports';

export interface AmenityDefinitionDto {
  id: string;
  key: string;
  label: string;
  sourceIconUrl: string;
  count?: number;
}

export interface ParkPoolScheduleDto {
  day: string;
  hours: string;
}

export interface ParkPoolDetailsDto {
  todayHours: string;
  nextWindow: string;
  seasonLabel: string;
  status: {
    state: string;
    headline: string;
    accentLabel: string;
  };
  amenities: string[];
  weeklyHours: ParkPoolScheduleDto[];
  lessonsSummary: string;
  splashPadSummary: string;
  note?: string;
}

export interface ParkFacilityDetailsDto {
  poolDepthRanges?: string;
  kidFriendlyNotes?: string;
  accessibilityFeatures?: string[];
  accessibleRamp?: boolean;
  hasLifeguards?: boolean;
}

export interface ParkLocationDto {
  latitude: number;
  longitude: number;
}

export interface ParkCardDto {
  id: string;
  slug: string;
  name: string;
  address: string;
  mapQuery: string;
  detailUrl: string;
  imageUrl: string;
  kindLabel: string;
  browseSummary: string;
  hoursSummary: string;
  hasPool: boolean;
  hasSplashPad: boolean;
  coolDownCategory: 'pool' | 'splash-pad' | 'both' | 'none';
  amenityKeys: string[];
  amenityDefinitions: AmenityDefinitionDto[];
  location: ParkLocationDto;
  poolDetails?: ParkPoolDetailsDto;
  distanceMiles?: number;
}

export interface ParkDetailDto extends ParkCardDto {
  description: string;
  facilityDetails?: ParkFacilityDetailsDto;
  reportSummary: ParkReportSummaryDto;
  comments: ParkCommentDto[];
  checkIns: ParkCheckInSummaryDto;
}
