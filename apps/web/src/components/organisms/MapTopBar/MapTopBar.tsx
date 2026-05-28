import { ListFilter, Menu, Target } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import type { ParkQuickFilter } from '../../../features/park-explorer/useParkExplorer';
import styles from './MapTopBar.module.css';

interface MapTopBarProps {
  totalParks: number;
  visibleParks: number;
  visiblePoolSites: number;
  activeQuickFilter: ParkQuickFilter;
  selectedAmenityCount: number;
  onMenuToggle: () => void;
  onFilterToggle: () => void;
  onCenterMap: () => void;
}

const filterLabels: Record<ParkQuickFilter, string> = {
  all: 'All parks',
  'cool-down-spots': 'Cool-down spots',
  'near-me': 'Near me',
  'pool-sites': 'Pool sites',
  'open-now': 'Open now',
  'swim-lessons': 'Swim lessons',
  'splash-pads': 'Splash pads',
  playgrounds: 'Playgrounds',
  trails: 'Trails',
  sports: 'Sports',
  'boat-access': 'Boat access',
  picnic: 'Picnic',
  'community-centers': 'Community centers',
  accessible: 'Accessible',
  'dog-parks': 'Dog parks',
};

export const MapTopBar = ({
  totalParks,
  visibleParks,
  visiblePoolSites,
  activeQuickFilter,
  selectedAmenityCount,
  onMenuToggle,
  onFilterToggle,
  onCenterMap,
}: MapTopBarProps) => (
  <header className={styles.bar}>
    <div className={styles.left}>
      <IconButton label="Open park browser" onClick={onMenuToggle}>
        <Menu size={18} />
      </IconButton>
      <div className={styles.brand}>
        <p className={styles.title}>parksplash</p>
        <p className={styles.meta}>
          {visibleParks} of {totalParks} parks • {visiblePoolSites} pool sites
        </p>
      </div>
    </div>
    <div className={styles.right}>
      <button className={styles.filterState} onClick={onFilterToggle} type="button">
        <ListFilter size={14} />
        <span>
          {filterLabels[activeQuickFilter]}
          {selectedAmenityCount > 0 ? ` • ${selectedAmenityCount} amenities` : ''}
        </span>
      </button>
      <IconButton label="Center map" onClick={onCenterMap}>
        <Target size={18} />
      </IconButton>
    </div>
  </header>
);
