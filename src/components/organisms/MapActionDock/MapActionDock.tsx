import { ChevronUp, Info, Layers3 } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import styles from './MapActionDock.module.css';

interface MapActionDockProps {
  onToggleDrawer: () => void;
  onOpenGuide: () => void;
  onCenterMap: () => void;
}

export const MapActionDock = ({ onToggleDrawer, onOpenGuide, onCenterMap }: MapActionDockProps) => (
  <div className={styles.dock}>
    <IconButton label="Open season guide" onClick={onOpenGuide}>
      <Info size={18} />
    </IconButton>
    <IconButton label="Center map" onClick={onCenterMap}>
      <Layers3 size={18} />
    </IconButton>
    <IconButton label="Toggle pool drawer" onClick={onToggleDrawer}>
      <ChevronUp size={18} />
    </IconButton>
  </div>
);
