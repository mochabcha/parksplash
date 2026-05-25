import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { MapCanvas } from '../../atoms/MapCanvas/MapCanvas';
import { OUTDOOR_POOL_CENTER } from '../../../domain/pools/poolSeason';
import type { PoolViewModel } from '../../../domain/pools/pool.types';
import styles from './PoolMap.module.css';

interface PoolMapProps {
  pools: PoolViewModel[];
  selectedPoolId?: string;
  onSelectPool: (poolId: string) => void;
  recenterSignal: number;
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

const MapEffects = ({
  pools,
  selectedPoolId,
  recenterSignal,
}: {
  pools: PoolViewModel[];
  selectedPoolId?: string;
  recenterSignal: number;
}) => {
  const map = useMap();

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

    map.flyTo([selectedPool.latitude, selectedPool.longitude], Math.max(map.getZoom(), 13), {
      animate: true,
      duration: 0.45,
    });
  }, [map, pools, selectedPoolId]);

  return null;
};

export const PoolMap = ({ pools, selectedPoolId, onSelectPool, recenterSignal }: PoolMapProps) => (
  <MapCanvas>
    <MapContainer center={OUTDOOR_POOL_CENTER} className={styles.map} zoom={11} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEffects pools={pools} recenterSignal={recenterSignal} selectedPoolId={selectedPoolId} />
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
