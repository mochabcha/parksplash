export type SiteType = 'school' | 'park' | 'aquatic-center';

export type OpeningPlan = 'preseason' | 'july';

export type LessonsAccess = 'citywide' | 'onsite';

export type SplashPadAccess = 'not-listed';

export interface PoolRecord {
  id: string;
  name: string;
  address: string;
  siteType: SiteType;
  openingPlan: OpeningPlan;
  lessons: LessonsAccess;
  splashPad: SplashPadAccess;
  latitude: number;
  longitude: number;
  geocodeLabel: string;
}

export interface DailyHours {
  label: string;
  hours: string;
  note?: string;
}

export interface PoolStatus {
  state: 'open-now' | 'closed-now' | 'opens-later' | 'future-opening' | 'season-ended';
  headline: string;
  detail: string;
  accentLabel: string;
}

export interface PoolViewModel extends PoolRecord {
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
