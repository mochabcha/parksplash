import { CircleUserRound, Flag, Info, MoonStar, SunMedium } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import type { ThemeMode } from '../../../features/theme/useThemeMode';
import styles from './MapActionDock.module.css';

interface MapActionDockProps {
  onOpenGuide: () => void;
  onToggleTheme: () => void;
  onOpenAccount: () => void;
  onOpenReport: () => void;
  themeMode: ThemeMode;
}

export const MapActionDock = ({
  onOpenGuide,
  onToggleTheme,
  onOpenAccount,
  onOpenReport,
  themeMode
}: MapActionDockProps) => (
  <div className={styles.dock}>
    <IconButton label="Report on a park" onClick={onOpenReport}>
      <Flag size={18} />
    </IconButton>
    <IconButton label="Open parks and pools guide" onClick={onOpenGuide}>
      <Info size={18} />
    </IconButton>
    <IconButton label="Open account" onClick={onOpenAccount}>
      <CircleUserRound size={18} />
    </IconButton>
    <IconButton
      active={themeMode === 'dark'}
      label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggleTheme}
    >
      {themeMode === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
    </IconButton>
  </div>
);
