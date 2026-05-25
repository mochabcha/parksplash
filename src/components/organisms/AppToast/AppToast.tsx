import styles from './AppToast.module.css';

interface AppToastProps {
  toast: {
    id: number;
    message: string;
  } | null;
}

export const AppToast = ({ toast }: AppToastProps) => (
  <div className={`${styles.toast} ${toast ? styles.visible : ''}`} aria-live="polite">
    <p>{toast?.message}</p>
  </div>
);
