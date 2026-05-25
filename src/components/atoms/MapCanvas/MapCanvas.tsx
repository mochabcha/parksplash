import type { PropsWithChildren } from 'react';
import styles from './MapCanvas.module.css';

export const MapCanvas = ({ children }: PropsWithChildren) => (
  <div className={styles.mapCanvas}>{children}</div>
);
