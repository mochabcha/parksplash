import type { AmenityFilterOption, ParkAmenityDefinition, ParkViewModel } from './park.types';

const formatFallbackAmenityLabel = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());

export const resolveAmenityDefinition = (
  amenityMap: ReadonlyMap<string, ParkAmenityDefinition>,
  key: string,
) =>
  amenityMap.get(key) ?? {
    key,
    label: formatFallbackAmenityLabel(key),
    sourceIconUrl: '',
  };

export const buildAmenityFilterOptions = (
  parks: ParkViewModel[],
  amenityMap: ReadonlyMap<string, ParkAmenityDefinition>,
): AmenityFilterOption[] => {
  const counts = new Map<string, number>();

  for (const park of parks) {
    for (const key of park.amenityKeys) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([key, count]) => ({
      ...resolveAmenityDefinition(amenityMap, key),
      count,
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label);
    });
};
