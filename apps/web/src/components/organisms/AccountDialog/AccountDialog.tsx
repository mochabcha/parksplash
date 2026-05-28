import { useState } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Button } from '../../atoms/Button/Button';
import type { AuthUserDto } from '@parksplash/shared';
import styles from './AccountDialog.module.css';

interface AccountDialogProps {
  isOpen: boolean;
  user: AuthUserDto | null;
  authError: string;
  onClose: () => void;
  onSignIn: (input: { email: string; password: string }) => Promise<void>;
  onSignUp: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const AccountDialog = ({
  isOpen,
  user,
  authError,
  onClose,
  onSignIn,
  onSignUp,
  onSignOut
}: AccountDialogProps) => {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
            <p className={styles.eyebrow}>Account</p>
            <h2>{user ? 'Your profile' : 'Join parksplash'}</h2>
          </div>
          <IconButton label="Close account dialog" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        {user ? (
          <div className={styles.profile}>
            <p className={styles.displayName}>{user.displayName}</p>
            <p className={styles.meta}>{user.email}</p>
            <p className={styles.meta}>
              {user.emailVerified ? 'Email verified' : 'Check your inbox to verify your email.'}
            </p>
            <Button onClick={() => void onSignOut()}>Sign out</Button>
          </div>
        ) : (
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();

              if (mode === 'sign-in') {
                void onSignIn({ email, password });
                return;
              }

              void onSignUp({ displayName, email, password });
            }}
          >
            <div className={styles.tabs}>
              <Button onClick={() => setMode('sign-in')} selected={mode === 'sign-in'} type="button">
                Sign in
              </Button>
              <Button onClick={() => setMode('sign-up')} selected={mode === 'sign-up'} type="button">
                Create account
              </Button>
            </div>
            {mode === 'sign-up' ? (
              <label className={styles.field}>
                <span>Display name</span>
                <input onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
              </label>
            ) : null}
            <label className={styles.field}>
              <span>Email</span>
              <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            </label>
            {authError ? <p className={styles.error}>{authError}</p> : null}
            <Button type="submit">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</Button>
          </form>
        )}
      </section>
    </>
  );
};
