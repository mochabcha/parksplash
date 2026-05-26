import { X } from 'lucide-react';
import { AmenityIcon } from '../../atoms/AmenityIcon/AmenityIcon';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { FilterChip } from '../../molecules/FilterChip/FilterChip';
import { ParkListItem } from '../../molecules/ParkListItem/ParkListItem';
import type { AmenityFilterOption, ParkViewModel } from '../../../domain/parks/park.types';
import type { ParkQuickFilter } from '../../../features/park-explorer/useParkExplorer';
import styles from './ParkSidePanel.module.css';

interface ParkSidePanelProps {
  parks: ParkViewModel[];
  selectedParkId?: string;
  activeQuickFilter: ParkQuickFilter;
  selectedAmenityKeys: string[];
  amenityOptions: AmenityFilterOption[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPark: (parkId: string) => void;
  onQuickFilterChange: (filter: ParkQuickFilter) => void;
  onAmenityToggle: (amenityKey: string) => void;
  onClearAmenities: () => void;
}

const quickFilters: { id: ParkQuickFilter; label: string }[] = [
  { id: 'all', label: 'All parks' },
  { id: 'pool-sites', label: 'Pool sites' },
  { id: 'open-now', label: 'Open now' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'splash-pads', label: 'Splash pads' },
];

export const ParkSidePanel = ({
  parks,
  selectedParkId,
  activeQuickFilter,
  selectedAmenityKeys,
  amenityOptions,
  isOpen,
  onClose,
  onSelectPark,
  onQuickFilterChange,
  onAmenityToggle,
  onClearAmenities,
}: ParkSidePanelProps) => (
  <>
    <button
      aria-hidden={!isOpen}
      className={`${styles.scrim} ${isOpen ? styles.scrimOpen : ''}`}
      onClick={onClose}
      tabIndex={isOpen ? 0 : -1}
      type="button"
    />
    <aside aria-hidden={!isOpen} className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Browse parks</p>
          <p className={styles.meta}>{parks.length} visible on map</p>
        </div>
        <IconButton label="Close park browser" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.subHeader}>
          <p className={styles.sectionTitle}>Quick filters</p>
        </div>
        <div className={styles.quickFilters}>
          {quickFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              onClick={() => onQuickFilterChange(filter.id)}
              selected={activeQuickFilter === filter.id}
            />
          ))}
        </div>
      </div>

      <div className={styles.amenities}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionTitle}>Amenities</p>
            <p className={styles.sectionMeta}>
              {selectedAmenityKeys.length > 0
                ? `${selectedAmenityKeys.length} active`
                : 'Filter the map by park features'}
            </p>
          </div>
          {selectedAmenityKeys.length > 0 ? (
            <button className={styles.clearButton} onClick={onClearAmenities} type="button">
              Clear
            </button>
          ) : null}
        </div>
        <div className={styles.amenityChips}>
          {amenityOptions.map((amenity) => (
            <FilterChip
              key={amenity.key}
              label={amenity.label}
              leadingVisual={<AmenityIcon label={amenity.label} src={amenity.sourceIconUrl} />}
              onClick={() => onAmenityToggle(amenity.key)}
              selected={selectedAmenityKeys.includes(amenity.key)}
              trailingValue={amenity.count}
            />
          ))}
        </div>
      </div>

      <ul className={styles.list}>
        {parks.length > 0 ? (
          parks.map((park) => (
            <li className={styles.item} key={park.id}>
              <ParkListItem
                onClick={() => onSelectPark(park.id)}
                park={park}
                selected={selectedParkId === park.id}
              />
            </li>
          ))
        ) : (
          <li className={styles.empty}>No parks match the current filter set.</li>
        )}
      </ul>
    </aside>
  </>
);
