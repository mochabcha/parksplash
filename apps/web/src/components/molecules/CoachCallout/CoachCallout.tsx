import { Button } from '../../atoms/Button/Button';
import styles from './CoachCallout.module.css';

interface CoachCalloutProps {
  title: string;
  body: string;
  stepIndex: number;
  totalSteps: number;
  onDismiss: () => void;
}

export const CoachCallout = ({
  title,
  body,
  stepIndex,
  totalSteps,
  onDismiss
}: CoachCalloutProps) => (
  <section className={styles.callout}>
    <p className={styles.eyebrow}>
      First-time guide
      <span className={styles.count}>
        {stepIndex}/{totalSteps}
      </span>
    </p>
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.body}>{body}</p>
    <div className={styles.actions}>
      <Button className={styles.dismissButton} onClick={onDismiss}>
        Keep exploring
      </Button>
    </div>
  </section>
);
