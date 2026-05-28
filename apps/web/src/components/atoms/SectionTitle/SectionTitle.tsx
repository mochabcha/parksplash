import type { PropsWithChildren } from 'react';
import styles from './SectionTitle.module.css';

export const SectionTitle = ({ children }: PropsWithChildren) => (
  <h2 className={styles.title}>{children}</h2>
);
