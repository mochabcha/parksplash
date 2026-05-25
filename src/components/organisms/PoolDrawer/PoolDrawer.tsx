import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Clock3, GraduationCap, MapPin, Waves, X } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { SectionTitle } from '../../atoms/SectionTitle/SectionTitle';
import { AmenityPill } from '../../molecules/AmenityPill/AmenityPill';
import { DrawerHandle } from '../../molecules/DrawerHandle/DrawerHandle';
import { HoursPanel } from '../../molecules/HoursPanel/HoursPanel';
import { InfoRow } from '../../molecules/InfoRow/InfoRow';
import type { PoolViewModel } from '../../../domain/pools/pool.types';
import styles from './PoolDrawer.module.css';

interface PoolDrawerProps {
  pool?: PoolViewModel;
  isExpanded: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const PoolDrawer = ({ pool, isExpanded, onOpen, onClose }: PoolDrawerProps) => {
  const dragState = useRef<{ pointerId: number; startY: number } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    const movement = event.clientY - dragState.current.startY;
    dragState.current = null;

    if (movement <= -18) {
      onOpen();
    }

    if (movement >= 18) {
      onClose();
    }
  };

  const clearDragState = () => {
    dragState.current = null;
  };

  return (
    <section className={`${styles.drawer} ${isExpanded ? styles.expanded : ''}`}>
      <div
        aria-label="Drag pool drawer"
        className={styles.handleZone}
        onPointerCancel={clearDragState}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        role="presentation"
      >
        <DrawerHandle />
      </div>

      <div className={styles.contentWrap}>
        <div className={styles.content}>
          {pool ? (
            <>
              <div className={styles.hero}>
                <div>
                  <p className={styles.kicker}>{pool.status.accentLabel}</p>
                  <h2 className={styles.title}>{pool.name}</h2>
                  <p className={styles.address}>
                    <MapPin size={15} />
                    {pool.address}
                  </p>
                </div>
                <IconButton label="Collapse pool drawer" onClick={onClose}>
                  <X size={18} />
                </IconButton>
              </div>

              <div className={styles.inlineStatus}>
                <p>{pool.status.headline}</p>
                <span>{pool.status.detail}</span>
              </div>

              <div className={styles.pills}>
                {pool.amenities.map((amenity) => (
                  <AmenityPill key={amenity} label={amenity} />
                ))}
              </div>

              <div className={styles.section}>
                <SectionTitle>Today</SectionTitle>
                <div className={styles.infoGrid}>
                  <InfoRow
                    eyebrow="Swim window"
                    value={
                      <span className={styles.iconLine}>
                        <Clock3 size={16} />
                        {pool.todayHours}
                      </span>
                    }
                  />
                  <InfoRow eyebrow="Season" value={pool.seasonLabel} />
                </div>
              </div>

              <div className={styles.section}>
                <SectionTitle>Weekly Hours</SectionTitle>
                <HoursPanel rows={pool.weeklyHours} />
              </div>

              <div className={styles.section}>
                <SectionTitle>Programs</SectionTitle>
                <div className={styles.programs}>
                  <InfoRow
                    eyebrow="Swim lessons"
                    value={
                      <span className={styles.iconLine}>
                        <GraduationCap size={16} />
                        {pool.lessonsSummary}
                      </span>
                    }
                  />
                  <InfoRow
                    eyebrow="Splash pads"
                    value={
                      <span className={styles.iconLine}>
                        <Waves size={16} />
                        {pool.splashPadSummary}
                      </span>
                    }
                  />
                </div>
              </div>

              {pool.note ? <p className={styles.note}>{pool.note}</p> : null}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Select a pool marker to load the info drawer, or drag the handle upward to open it.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
