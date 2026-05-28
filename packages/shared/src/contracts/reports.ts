export type ParkReportType = 'cleanliness' | 'safety' | 'weather' | 'crowdedness' | 'facility';

export type CleanlinessFacility =
  | 'restroom'
  | 'playground'
  | 'splash-pad'
  | 'pool'
  | 'picnic-area'
  | 'walking-trail'
  | 'general';

export type CleanlinessRating = 'very-clean' | 'clean' | 'mixed' | 'dirty' | 'very-dirty';

export type SafetyConcern =
  | 'fighting'
  | 'aggressive-behavior'
  | 'unsafe-equipment'
  | 'poor-lighting'
  | 'suspicious-activity'
  | 'traffic-hazard'
  | 'medical-emergency'
  | 'other';

export type WeatherIssue = 'rain-closure' | 'lightning-closure' | 'heat-warning' | 'flooding' | 'other';

export type CrowdednessLevel = 'empty' | 'light' | 'steady' | 'busy' | 'packed';
export type StaffSupportSignal = 'unknown' | 'absent' | 'limited' | 'helpful' | 'excellent';
export type KidFriendlySignal = 'unknown' | 'not-recommended' | 'mixed' | 'good' | 'great';

export interface ParkReportInput {
  parkId: string;
  reportType: ParkReportType;
  cleanlinessFacility?: CleanlinessFacility;
  cleanlinessRating?: CleanlinessRating;
  safetyConcern?: SafetyConcern;
  weatherIssue?: WeatherIssue;
  crowdednessLevel?: CrowdednessLevel;
  staffSupportSignal?: StaffSupportSignal;
  kidFriendlySignal?: KidFriendlySignal;
  submittedWeather?: string;
  note?: string;
}

export interface ParkReportDto extends ParkReportInput {
  id: string;
  userId: string;
  createdAt: string;
}

export interface ParkReportSummaryDto {
  crowdedness: CrowdednessLevel | 'unknown';
  cleanliness: CleanlinessRating | 'unknown';
  safetyFlags: SafetyConcern[];
  weatherFlags: WeatherIssue[];
  totalReports: number;
  updatedAt?: string;
}
