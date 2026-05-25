import type { PropsWithChildren } from 'react';
import styles from './AppShell.module.css';

export const AppShell = ({ children }: PropsWithChildren) => (
  <div className={styles.viewport}>
    <div className={styles.device}>{children}</div>
  </div>
);
