import type { PropsWithChildren } from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends PropsWithChildren {
  tone?: 'warm' | 'cool' | 'neutral';
}

export const Badge = ({ children, tone = 'neutral' }: BadgeProps) => (
  <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
);
