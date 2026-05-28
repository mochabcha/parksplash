import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { IconButton } from '../../atoms/IconButton/IconButton';
import type { ParkViewModel } from '../../../domain/parks/park.types';
import styles from './ReportComposer.module.css';

interface ReportComposerProps {
  isOpen: boolean;
  park?: ParkViewModel;
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => Promise<void>;
}

export const ReportComposer = ({ isOpen, park, onClose, onSubmit }: ReportComposerProps) => {
  const [reportType, setReportType] = useState('crowdedness');
  const [value, setValue] = useState('busy');
  const [note, setNote] = useState('');

  return (
    <>
      <button
        aria-hidden={!isOpen}
        className={`${styles.scrim} ${isOpen ? styles.scrimVisible : ''}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <section
        aria-hidden={!isOpen}
        aria-modal="true"
        className={`${styles.dialog} ${isOpen ? styles.dialogVisible : ''}`}
        role="dialog"
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Report a condition</p>
            <h2>{park ? `Update ${park.name}` : 'Choose a park from the map first'}</h2>
          </div>
          <IconButton label="Close report composer" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {park ? (
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit({
                parkId: park.id,
                reportType,
                note,
                crowdednessLevel: reportType === 'crowdedness' ? value : undefined,
                cleanlinessRating: reportType === 'cleanliness' ? value : undefined,
                safetyConcern: reportType === 'safety' ? value : undefined,
                weatherIssue: reportType === 'weather' ? value : undefined
              });
            }}
          >
            <label className={styles.field}>
              <span>Report type</span>
              <select onChange={(event) => setReportType(event.target.value)} value={reportType}>
                <option value="crowdedness">Crowdedness</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="safety">Safety</option>
                <option value="weather">Weather</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Detail</span>
              <input onChange={(event) => setValue(event.target.value)} value={value} />
            </label>
            <label className={styles.field}>
              <span>Note</span>
              <textarea onChange={(event) => setNote(event.target.value)} rows={4} value={note} />
            </label>
            <Button type="submit">Submit report</Button>
          </form>
        ) : null}
      </section>
    </>
  );
};
