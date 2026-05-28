export type ParkQuickFilter =
  | 'all'
  | 'cool-down-spots'
  | 'near-me'
  | 'pool-sites'
  | 'open-now'
  | 'swim-lessons'
  | 'splash-pads'
  | 'playgrounds'
  | 'trails'
  | 'sports'
  | 'boat-access'
  | 'picnic'
  | 'community-centers'
  | 'accessible'
  | 'dog-parks';

export interface ParkSearchFilters {
  amenityKeys?: string[];
  nearMe?: {
    latitude: number;
    longitude: number;
    radiusMiles?: number;
  };
  coolDown?: boolean;
  hasPool?: boolean;
  hasSplashPad?: boolean;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  sortByDistance?: boolean;
}
