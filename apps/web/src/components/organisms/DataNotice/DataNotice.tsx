import { AlertTriangle, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import styles from './DataNotice.module.css';

interface DataNoticeProps {
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

export const DataNotice = ({ isLoading, errorMessage, onRetry }: DataNoticeProps) => {
  if (!isLoading && !errorMessage) {
    return null;
  }

  return (
    <div className={`${styles.notice} ${errorMessage ? styles.error : styles.loading}`.trim()} role="status">
      <div className={styles.copy}>
        {isLoading ? <LoaderCircle className={styles.iconSpin} size={18} /> : <AlertTriangle size={18} />}
        <div>
          <p className={styles.title}>{isLoading ? 'Loading live park data' : 'Live park data is unavailable'}</p>
          <p className={styles.message}>
            {isLoading
              ? 'parksplash is syncing the latest park data from the CMS.'
              : errorMessage}
          </p>
        </div>
      </div>
      {errorMessage ? (
        <Button className={styles.retry} onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </Button>
      ) : null}
    </div>
  );
};
