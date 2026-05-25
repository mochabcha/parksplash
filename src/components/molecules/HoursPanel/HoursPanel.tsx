import type { DailyHours } from '../../../domain/pools/pool.types';
import styles from './HoursPanel.module.css';

interface HoursPanelProps {
  rows: DailyHours[];
}

export const HoursPanel = ({ rows }: HoursPanelProps) => (
  <div className={styles.panel}>
    {rows.map((row) => (
      <div className={styles.row} key={row.label}>
        <div>
          <p className={styles.label}>{row.label}</p>
          {row.note ? <p className={styles.note}>{row.note}</p> : null}
        </div>
        <p className={styles.hours}>{row.hours}</p>
      </div>
    ))}
  </div>
);
