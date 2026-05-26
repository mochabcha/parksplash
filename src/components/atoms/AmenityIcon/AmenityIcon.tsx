import { Sparkles } from 'lucide-react';
import styles from './AmenityIcon.module.css';

interface AmenityIconProps {
  label: string;
  src?: string;
}

export const AmenityIcon = ({ label, src }: AmenityIconProps) => (
  <span aria-hidden="true" className={styles.icon}>
    {src ? <img alt="" loading="lazy" src={src} /> : <Sparkles className={styles.fallback} size={14} />}
  </span>
);
