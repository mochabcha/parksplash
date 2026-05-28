import type { ReactNode } from 'react';
import styles from './InfoRow.module.css';

interface InfoRowProps {
  eyebrow: string;
  value: ReactNode;
}

export const InfoRow = ({ eyebrow, value }: InfoRowProps) => (
  <div className={styles.row}>
    <p className={styles.eyebrow}>{eyebrow}</p>
    <div className={styles.value}>{value}</div>
  </div>
);
