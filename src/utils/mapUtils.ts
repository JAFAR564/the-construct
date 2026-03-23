import { Sector } from '../types';

export interface GlobeMarker {
  location: [number, number]; // [lat, lng]
  size: number;
  sectorId: number;
}

/**
 * Assigns spherical coordinates (Lat/Lng) to sectors based on their ID and faction.
 */
export const getSectorCoordinates = (sectorId: number): [number, number] => {
  if (sectorId <= 16) {
    const angle = (sectorId / 16) * Math.PI * 2;
    return [45 + Math.sin(angle) * 15, Math.cos(angle) * 60];
  }
  if (sectorId <= 32) {
    const angle = ((sectorId - 16) / 16) * Math.PI * 2;
    return [Math.sin(angle) * 10, (sectorId - 16) * 10 - 80];
  }
  const angle = ((sectorId - 32) / 18) * Math.PI * 2;
  return [-45 + Math.sin(angle) * 15, Math.cos(angle) * 60];
};

export const generateGlobeMarkers = (sectors: Sector[]): GlobeMarker[] => {
  return sectors.map(sector => ({
    location: getSectorCoordinates(sector.id),
    size: 0.1,
    sectorId: sector.id
  }));
};
