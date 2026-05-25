import { X } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import styles from './AppDialog.module.css';

interface AppDialogProps {
  isOpen: boolean;
  title: string;
  sections: {
    heading: string;
    items: string[];
  }[];
  actions: {
    label: string;
    onClick: () => void;
  }[];
  onClose: () => void;
}

export const AppDialog = ({ isOpen, title, sections, actions, onClose }: AppDialogProps) => (
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
        <h2>{title}</h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>
      <div className={styles.body}>
        {sections.map((section) => (
          <div className={styles.section} key={section.heading}>
            <h3>{section.heading}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        {actions.map((action) => (
          <button className={styles.action} key={action.label} onClick={action.onClick} type="button">
            {action.label}
          </button>
        ))}
      </div>
    </section>
  </>
);
