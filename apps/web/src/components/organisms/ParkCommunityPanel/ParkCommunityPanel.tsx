import { Button } from '../../atoms/Button/Button';
import type { ParkViewModel } from '../../../domain/parks/park.types';
import styles from './ParkCommunityPanel.module.css';

interface ParkCommunityPanelProps {
  park: ParkViewModel;
  isAuthenticated: boolean;
  onOpenReport: () => void;
  onCheckIn: () => void;
  onComment: (body: string) => void;
}

export const ParkCommunityPanel = ({
  park,
  isAuthenticated,
  onOpenReport,
  onCheckIn,
  onComment
}: ParkCommunityPanelProps) => (
  <section className={styles.panel}>
    <div className={styles.summary}>
      <div>
        <p className={styles.eyebrow}>Live signals</p>
        <p className={styles.meta}>Crowdedness: {park.reportSummary.crowdedness}</p>
        <p className={styles.meta}>Cleanliness: {park.reportSummary.cleanliness}</p>
        <p className={styles.meta}>{park.checkIns.totalActive} active check-ins</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={onOpenReport}>{isAuthenticated ? 'Report' : 'Sign in to report'}</Button>
        <Button onClick={onCheckIn}>{isAuthenticated ? 'Check in' : 'Sign in to check in'}</Button>
      </div>
    </div>
    <div className={styles.comments}>
      <p className={styles.eyebrow}>Comments</p>
      {park.comments.length > 0 ? (
        <ul className={styles.list}>
          {park.comments.slice(0, 4).map((comment) => (
            <li key={comment.id}>
              <strong>{comment.displayName}</strong>: {comment.body}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.meta}>No comments yet.</p>
      )}
      <Button onClick={() => onComment(window.prompt('Add a comment') ?? '')}>
        {isAuthenticated ? 'Add comment' : 'Sign in to comment'}
      </Button>
    </div>
  </section>
);
