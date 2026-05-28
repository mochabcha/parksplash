import { Waves, SunMedium } from 'lucide-react';
import { Badge } from '../../atoms/Badge/Badge';
import { FilterChip } from '../../molecules/FilterChip/FilterChip';
import type { PoolFilter } from '../../../features/pool-explorer/usePoolExplorer';
import styles from './PoolHeader.module.css';

interface PoolHeaderProps {
  totalPools: number;
  openNow: number;
  splashPads: number;
  activeFilter: PoolFilter;
  onFilterChange: (filter: PoolFilter) => void;
}

const filters: { id: PoolFilter; label: string }[] = [
  { id: 'all', label: 'All pools' },
  { id: 'open-now', label: 'Open now' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'july', label: 'July site' },
];

export const PoolHeader = ({
  totalPools,
  openNow,
  splashPads,
  activeFilter,
  onFilterChange,
}: PoolHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.ribbon}>
      <Badge tone="warm">
        <SunMedium size={14} />
        2026 Outdoor Guide
      </Badge>
      <Badge tone="cool">
        <Waves size={14} />
        OpenStreetMap
      </Badge>
    </div>

    <div className={styles.copy}>
      <p className={styles.kicker}>Jacksonville pool finder</p>
      <h1 className={styles.title}>One map. One tap. Fast pool hours.</h1>
      <p className={styles.summary}>
        Pick a marker to open the drawer for today&apos;s schedule, lessons, and seasonal notes.
      </p>
    </div>

    <div className={styles.metrics}>
      <div>
        <span>{totalPools}</span>
        <p>mapped pools</p>
      </div>
      <div>
        <span>{openNow}</span>
        <p>open right now</p>
      </div>
      <div>
        <span>{splashPads}</span>
        <p>splash pads citywide</p>
      </div>
    </div>

    <div className={styles.filters}>
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          label={filter.label}
          onClick={() => onFilterChange(filter.id)}
          selected={activeFilter === filter.id}
        />
      ))}
    </div>
  </header>
);
