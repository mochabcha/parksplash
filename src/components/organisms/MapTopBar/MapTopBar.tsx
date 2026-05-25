import { ListFilter, Menu, Target } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import type { PoolFilter } from '../../../features/pool-explorer/usePoolExplorer';
import styles from './MapTopBar.module.css';

interface MapTopBarProps {
  totalPools: number;
  openNow: number;
  activeFilter: PoolFilter;
  onMenuToggle: () => void;
  onCenterMap: () => void;
}

const filterLabels: Record<PoolFilter, string> = {
  all: 'All pools',
  'open-now': 'Open now',
  lessons: 'Lessons',
  july: 'July site',
};

export const MapTopBar = ({
  totalPools,
  openNow,
  activeFilter,
  onMenuToggle,
  onCenterMap,
}: MapTopBarProps) => (
  <header className={styles.bar}>
    <div className={styles.left}>
      <IconButton label="Open pool browser" onClick={onMenuToggle}>
        <Menu size={18} />
      </IconButton>
      <div className={styles.brand}>
        <p className={styles.title}>Splash Spot</p>
        <p className={styles.meta}>
          {totalPools} pools • {openNow} open
        </p>
      </div>
    </div>
    <div className={styles.right}>
      <div className={styles.filterState}>
        <ListFilter size={14} />
        <span>{filterLabels[activeFilter]}</span>
      </div>
      <IconButton label="Center map" onClick={onCenterMap}>
        <Target size={18} />
      </IconButton>
    </div>
  </header>
);
