import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { MapCanvas } from '../../atoms/MapCanvas/MapCanvas';
import { OUTDOOR_POOL_CENTER } from '../../../domain/pools/poolSeason';
import type { PoolViewModel } from '../../../domain/pools/pool.types';
import styles from './PoolMap.module.css';

const FOCUSED_POOL_ZOOM = 15;

interface PoolMapProps {
  pools: PoolViewModel[];
  selectedPoolId?: string;
  onSelectPool: (poolId: string) => void;
  recenterSignal: number;
  isDrawerExpanded: boolean;
}

const activeMarkerIcon = new L.DivIcon({
  className: styles.markerShell,
  html: '<span class="marker markerActive"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const defaultMarkerIcon = new L.DivIcon({
  className: styles.markerShell,
  html: '<span class="marker"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const getFocusedCenter = (
  map: L.Map,
  pool: PoolViewModel,
  zoomLevel: number,
  isDrawerExpanded: boolean,
) => {
  const markerPoint = map.project([pool.latitude, pool.longitude], zoomLevel);
  const verticalOffset = isDrawerExpanded ? map.getSize().y * 0.22 : 0;

  return map.unproject(markerPoint.add([0, verticalOffset]), zoomLevel);
};

const MapEffects = ({
  pools,
  selectedPoolId,
  recenterSignal,
  isDrawerExpanded,
}: {
  pools: PoolViewModel[];
  selectedPoolId?: string;
  recenterSignal: number;
  isDrawerExpanded: boolean;
}) => {
  const map = useMap();
  const previousSelectedPoolId = useRef<string>();
  const previousDrawerExpanded = useRef(isDrawerExpanded);

  useEffect(() => {
    if (pools.length === 0) {
      map.setView(OUTDOOR_POOL_CENTER, 10);
      return;
    }

    const bounds = L.latLngBounds(pools.map((pool) => [pool.latitude, pool.longitude] as [number, number]));
    map.fitBounds(bounds.pad(0.14), { animate: true, duration: 0.6 });
  }, [map, pools, recenterSignal]);

  useEffect(() => {
    if (!selectedPoolId) {
      return;
    }

    const selectedPool = pools.find((pool) => pool.id === selectedPoolId);

    if (!selectedPool) {
      return;
    }

    const selectedPoolChanged = previousSelectedPoolId.current !== selectedPoolId;
    const drawerJustOpened = !previousDrawerExpanded.current && isDrawerExpanded;

    if (selectedPoolChanged) {
      const nextZoom = FOCUSED_POOL_ZOOM;
      const nextCenter = getFocusedCenter(map, selectedPool, nextZoom, isDrawerExpanded);

      map.flyTo(nextCenter, nextZoom, {
        animate: true,
        duration: 0.45,
      });
    } else if (drawerJustOpened) {
      const nextCenter = getFocusedCenter(map, selectedPool, FOCUSED_POOL_ZOOM, true);

      map.flyTo(nextCenter, FOCUSED_POOL_ZOOM, {
        animate: true,
        duration: 0.35,
      });
    }

    previousSelectedPoolId.current = selectedPoolId;
    previousDrawerExpanded.current = isDrawerExpanded;
  }, [isDrawerExpanded, map, pools, selectedPoolId]);

  useEffect(() => {
    if (!selectedPoolId) {
      previousSelectedPoolId.current = undefined;
    }

    previousDrawerExpanded.current = isDrawerExpanded;
  }, [isDrawerExpanded, selectedPoolId]);

  return null;
};

export const PoolMap = ({
  pools,
  selectedPoolId,
  onSelectPool,
  recenterSignal,
  isDrawerExpanded,
}: PoolMapProps) => (
  <MapCanvas>
    <MapContainer center={OUTDOOR_POOL_CENTER} className={styles.map} zoom={11} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEffects
        isDrawerExpanded={isDrawerExpanded}
        pools={pools}
        recenterSignal={recenterSignal}
        selectedPoolId={selectedPoolId}
      />
      {pools.map((pool) => (
        <Marker
          eventHandlers={{ click: () => onSelectPool(pool.id) }}
          icon={pool.id === selectedPoolId ? activeMarkerIcon : defaultMarkerIcon}
          key={pool.id}
          position={[pool.latitude, pool.longitude]}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={pool.id === selectedPoolId}>
            {pool.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  </MapCanvas>
);
