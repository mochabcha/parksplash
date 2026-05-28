import type { ParkAmenityDefinition, ParkViewModel } from './park.types';

const amenityMap = new Map<string, ParkAmenityDefinition>();

export const getParkAmenityMap = () => amenityMap;
export const getParkDirectory = (): ParkViewModel[] => [];
