import { X } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { FilterChip } from '../../molecules/FilterChip/FilterChip';
import type { PoolViewModel } from '../../../domain/pools/pool.types';
import type { PoolFilter } from '../../../features/pool-explorer/usePoolExplorer';
import styles from './PoolSidePanel.module.css';

interface PoolSidePanelProps {
  pools: PoolViewModel[];
  selectedPoolId?: string;
  activeFilter: PoolFilter;
  isOpen: boolean;
  onClose: () => void;
  onSelectPool: (poolId: string) => void;
  onFilterChange: (filter: PoolFilter) => void;
}

const filters: { id: PoolFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open-now', label: 'Open now' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'july', label: 'July' },
];

export const PoolSidePanel = ({
  pools,
  selectedPoolId,
  activeFilter,
  isOpen,
  onClose,
  onSelectPool,
  onFilterChange,
}: PoolSidePanelProps) => (
  <>
    <button
      aria-hidden={!isOpen}
      className={`${styles.scrim} ${isOpen ? styles.scrimOpen : ''}`}
      onClick={onClose}
      tabIndex={isOpen ? 0 : -1}
      type="button"
    />
    <aside className={`${styles.panel} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Browse pools</p>
          <p className={styles.meta}>{pools.length} visible on map</p>
        </div>
        <IconButton label="Close browser" onClick={onClose}>
          <X size={18} />
        </IconButton>
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

      <ul className={styles.list}>
        {pools.map((pool) => (
          <li className={styles.item} key={pool.id}>
            <button
              className={`${styles.poolButton} ${selectedPoolId === pool.id ? styles.active : ''}`}
              onClick={() => onSelectPool(pool.id)}
              type="button"
            >
              <span className={styles.poolName}>{pool.name}</span>
              <span className={styles.poolMeta}>
                {pool.todayHours} • {pool.status.accentLabel}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  </>
);
