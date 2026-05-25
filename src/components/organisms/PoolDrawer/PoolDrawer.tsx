import { ChevronDown, Clock3, GraduationCap, MapPin, Waves, X } from 'lucide-react';
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
  onToggle: () => void;
  onClose: () => void;
}

export const PoolDrawer = ({ pool, isExpanded, onToggle, onClose }: PoolDrawerProps) => (
  <section className={`${styles.drawer} ${isExpanded ? styles.expanded : ''}`}>
    <button className={styles.summaryBar} onClick={onToggle} type="button">
      <DrawerHandle />
      <div className={styles.summaryText}>
        <p className={styles.summaryTitle}>{pool?.name ?? 'Tap a marker to inspect a pool'}</p>
        <p className={styles.summaryMeta}>
          {pool ? `${pool.todayHours} • ${pool.status.accentLabel}` : 'Browse from the map or the side drawer'}
        </p>
      </div>
      <ChevronDown className={styles.chevron} size={18} />
    </button>

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
            <p>Select a pool marker or open the browser drawer to compare locations and hours.</p>
          </div>
        )}
      </div>
    </div>
  </section>
);
