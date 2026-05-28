import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { MapCanvas } from '../../atoms/MapCanvas/MapCanvas';
import type { ParkViewModel } from '../../../domain/parks/park.types';
import { OUTDOOR_POOL_CENTER } from '../../../domain/pools/poolSeason';
import styles from './ParkMap.module.css';

const FOCUSED_PARK_ZOOM = 15;

interface ParkMapProps {
  parks: ParkViewModel[];
  selectedParkId?: string;
  onSelectPark: (parkId: string) => void;
  recenterSignal: number;
  isDrawerExpanded: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const createMarkerIcon = (className: string, iconSize: number, iconAnchor: number) =>
  new L.DivIcon({
    className: styles.markerShell,
    html: `<span class="marker ${className}"></span>`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconAnchor, iconAnchor],
  });

const activeMarkerIcon = createMarkerIcon('markerActive', 24, 12);
const defaultParkIcon = createMarkerIcon('', 20, 10);
const poolParkIcon = createMarkerIcon('markerPool', 22, 11);
const splashParkIcon = createMarkerIcon('markerSplash', 22, 11);

const getMarkerIcon = (park: ParkViewModel, isSelected: boolean) => {
  if (isSelected) {
    return activeMarkerIcon;
  }

  if (park.hasPool) {
    return poolParkIcon;
  }

  if (park.hasSplashPad) {
    return splashParkIcon;
  }

  return defaultParkIcon;
};

const getFocusedCenter = (
  map: L.Map,
  park: ParkViewModel,
  zoomLevel: number,
  isDrawerExpanded: boolean,
) => {
  const markerPoint = map.project([park.latitude, park.longitude], zoomLevel);
  const verticalOffset = isDrawerExpanded ? map.getSize().y * 0.22 : 0;

  return map.unproject(markerPoint.add([0, verticalOffset]), zoomLevel);
};

const MapEffects = ({
  parks,
  selectedParkId,
  recenterSignal,
  isDrawerExpanded,
}: {
  parks: ParkViewModel[];
  selectedParkId?: string;
  recenterSignal: number;
  isDrawerExpanded: boolean;
}) => {
  const map = useMap();
  const previousSelectedParkId = useRef<string>();
  const previousDrawerExpanded = useRef(isDrawerExpanded);

  useEffect(() => {
    if (parks.length === 0) {
      map.setView(OUTDOOR_POOL_CENTER, 10);
      return;
    }

    const bounds = L.latLngBounds(parks.map((park) => [park.latitude, park.longitude] as [number, number]));
    map.fitBounds(bounds.pad(0.12), { animate: true, duration: 0.6 });
  }, [map, parks, recenterSignal]);

  useEffect(() => {
    if (!selectedParkId) {
      return;
    }

    const selectedPark = parks.find((park) => park.id === selectedParkId);

    if (!selectedPark) {
      return;
    }

    const selectedParkChanged = previousSelectedParkId.current !== selectedParkId;
    const drawerJustOpened = !previousDrawerExpanded.current && isDrawerExpanded;

    if (selectedParkChanged || drawerJustOpened) {
      const nextCenter = getFocusedCenter(map, selectedPark, FOCUSED_PARK_ZOOM, isDrawerExpanded);

      map.flyTo(nextCenter, FOCUSED_PARK_ZOOM, {
        animate: true,
        duration: selectedParkChanged ? 0.45 : 0.35,
      });
    }

    previousSelectedParkId.current = selectedParkId;
    previousDrawerExpanded.current = isDrawerExpanded;
  }, [isDrawerExpanded, map, parks, selectedParkId]);

  useEffect(() => {
    if (!selectedParkId) {
      previousSelectedParkId.current = undefined;
    }

    previousDrawerExpanded.current = isDrawerExpanded;
  }, [isDrawerExpanded, selectedParkId]);

  return null;
};

export const ParkMap = ({
  parks,
  selectedParkId,
  onSelectPark,
  recenterSignal,
  isDrawerExpanded,
  userLocation,
}: ParkMapProps) => (
  <MapCanvas>
    <MapContainer center={OUTDOOR_POOL_CENTER} className={styles.map} zoom={11} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEffects
        isDrawerExpanded={isDrawerExpanded}
        parks={parks}
        recenterSignal={recenterSignal}
        selectedParkId={selectedParkId}
      />
      {parks.map((park) => (
        <Marker
          eventHandlers={{ click: () => onSelectPark(park.id) }}
          icon={getMarkerIcon(park, park.id === selectedParkId)}
          key={park.id}
          position={[park.latitude, park.longitude]}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={park.id === selectedParkId}>
            {park.name}
          </Tooltip>
        </Marker>
      ))}
      {userLocation ? (
        <Marker icon={activeMarkerIcon} position={[userLocation.latitude, userLocation.longitude]}>
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            You are here
          </Tooltip>
        </Marker>
      ) : null}
    </MapContainer>
  </MapCanvas>
);
