import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  label: string;
  active?: boolean;
}

export const IconButton = ({
  label,
  active = false,
  className = '',
  children,
  ...props
}: IconButtonProps) => (
  <button
    aria-label={label}
    className={`${styles.button} ${active ? styles.active : ''} ${className}`.trim()}
    type="button"
    {...props}
  >
    {children}
  </button>
);
