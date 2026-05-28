import { useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import styles from './LoveOfferingDialog.module.css';

interface LoveOfferingDialogProps {
  isOpen: boolean;
  defaultEmail: string;
  isEmailLocked?: boolean;
  source: 'google-maps' | 'park-limit';
  onSubmit: (input: { amount: number; email: string }) => Promise<void>;
}

const presets = [5, 10, 25, 50] as const;

export const LoveOfferingDialog = ({
  isOpen,
  defaultEmail,
  isEmailLocked = false,
  source,
  onSubmit
}: LoveOfferingDialogProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'other'>(5);
  const [customAmount, setCustomAmount] = useState('0');
  const [email, setEmail] = useState(defaultEmail);

  return (
    <section
      aria-hidden={!isOpen}
      aria-modal="true"
      className={`${styles.dialog} ${isOpen ? styles.visible : ''}`}
      role="dialog"
    >
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Love offering</p>
        <h2>Support parksplash before you keep going.</h2>
        <p className={styles.message}>
          This one-time prompt appears when you head to Google Maps or after you browse more than five parks. Pick
          what it is worth to you.
        </p>
        <p className={styles.meta}>Trigger: {source === 'google-maps' ? 'Google Maps directions' : 'Browsing limit'}</p>
      </div>
      <div className={styles.options}>
        {presets.map((amount) => (
          <Button key={amount} onClick={() => setSelectedAmount(amount)} selected={selectedAmount === amount}>
            ${amount}
          </Button>
        ))}
        <Button onClick={() => setSelectedAmount('other')} selected={selectedAmount === 'other'}>
          Other
        </Button>
      </div>
      {selectedAmount === 'other' ? (
        <label className={styles.field}>
          <span>Custom amount</span>
          <input onChange={(event) => setCustomAmount(event.target.value)} type="number" value={customAmount} />
          <small>Use $0 if you want to continue without paying.</small>
        </label>
      ) : null}
      <label className={styles.field}>
        <span>Email</span>
        <input
          disabled={isEmailLocked}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
      </label>
      <Button
        className={styles.submit}
        onClick={() =>
          void onSubmit({
            amount: selectedAmount === 'other' ? Number(customAmount) : selectedAmount,
            email
          })
        }
      >
        Continue
      </Button>
    </section>
  );
};
