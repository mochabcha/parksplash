import { Image } from 'lucide-react';
import type { ParkViewModel } from '../../../domain/parks/park.types';
import styles from './ParkListItem.module.css';

interface ParkListItemProps {
  park: ParkViewModel;
  selected?: boolean;
  onClick: () => void;
}

export const ParkListItem = ({ park, selected = false, onClick }: ParkListItemProps) => (
  <button
    className={`${styles.button} ${selected ? styles.selected : ''}`.trim()}
    onClick={onClick}
    type="button"
  >
    <span className={styles.thumb}>
      {park.localImagePath ? (
        <img alt="" loading="lazy" src={park.localImagePath} />
      ) : (
        <span className={styles.thumbFallback}>
          <Image size={18} />
        </span>
      )}
    </span>
    <span className={styles.body}>
      <span className={styles.eyebrow}>{park.kindLabel}</span>
      <span className={styles.name}>{park.name}</span>
      <span className={styles.meta}>{park.browseSummary || park.address}</span>
    </span>
  </button>
);
