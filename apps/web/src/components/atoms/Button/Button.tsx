import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  selected?: boolean;
}

export const Button = ({ children, selected = false, className = '', ...props }: ButtonProps) => (
  <button
    className={`${styles.button} ${selected ? styles.selected : ''} ${className}`.trim()}
    type="button"
    {...props}
  >
    {children}
  </button>
);
