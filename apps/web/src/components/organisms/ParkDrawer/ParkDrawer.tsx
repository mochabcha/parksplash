import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Clock3, GraduationCap, MapPin, Waves, X } from 'lucide-react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { SectionTitle } from '../../atoms/SectionTitle/SectionTitle';
import { AmenityPill } from '../../molecules/AmenityPill/AmenityPill';
import { DrawerHandle } from '../../molecules/DrawerHandle/DrawerHandle';
import { HoursPanel } from '../../molecules/HoursPanel/HoursPanel';
import { InfoRow } from '../../molecules/InfoRow/InfoRow';
import { ParkCommunityPanel } from '../ParkCommunityPanel/ParkCommunityPanel';
import type { ParkViewModel } from '../../../domain/parks/park.types';
import styles from './ParkDrawer.module.css';

interface ParkDrawerProps {
  park?: ParkViewModel;
  isExpanded: boolean;
  onOpen: () => void;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenReport: () => void;
  onOpenAccount: () => void;
  onComment: (body: string) => void;
  onCheckIn: () => void;
  onOpenMaps: (park: ParkViewModel) => void;
}

const buildGoogleMapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const ParkDrawer = ({
  park,
  isExpanded,
  onOpen,
  onClose,
  isAuthenticated,
  onOpenReport,
  onOpenAccount,
  onComment,
  onCheckIn,
  onOpenMaps
}: ParkDrawerProps) => {
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

  const mapsUrl = park ? buildGoogleMapsUrl(park.mapQuery || park.address) : '';

  return (
    <section className={`${styles.drawer} ${isExpanded ? styles.expanded : ''}`}>
      <div
        aria-label="Drag park drawer"
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
          {park ? (
            <>
              <div className={styles.summarySection}>
                <div className={styles.hero}>
                  <div>
                    <p className={styles.eyebrow}>{park.kindLabel}</p>
                    <h2 className={styles.title}>{park.name}</h2>
                    <a
                      className={styles.address}
                      href={mapsUrl}
                      onClick={(event) => {
                        event.preventDefault();
                        if (park) {
                          onOpenMaps(park);
                        }
                      }}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <MapPin size={15} />
                      <span>{park.address}</span>
                    </a>
                  </div>
                  <IconButton className={styles.closeButton} label="Collapse park drawer" onClick={onClose}>
                    <X size={18} />
                  </IconButton>
                </div>

                <p className={styles.summary}>
                  {park.poolDetails?.status.headline ??
                    park.hours ??
                    'No official hours were listed for this site.'}
                </p>
              </div>

              {park.localImagePath ? (
                <div className={styles.mediaSection}>
                  <div className={styles.image}>
                    <img alt="" loading="lazy" src={park.localImagePath} />
                  </div>
                </div>
              ) : null}

              <div className={styles.amenitiesSection}>
                <div className={styles.pills}>
                  {park.amenityDefinitions.map((amenity) => (
                    <AmenityPill key={amenity.key} iconSrc={amenity.sourceIconUrl} label={amenity.label} />
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <SectionTitle>Site Info</SectionTitle>
                <div className={styles.infoGrid}>
                  <InfoRow
                    eyebrow="Hours"
                    value={
                      <span className={styles.iconLine}>
                        <Clock3 size={16} />
                        {park.hoursSummary}
                      </span>
                    }
                  />
                  <InfoRow
                    eyebrow="Address"
                    value={
                      <a
                        className={styles.addressLink}
                        href={mapsUrl}
                        onClick={(event) => {
                          event.preventDefault();
                          if (park) {
                            onOpenMaps(park);
                          }
                        }}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {park.address}
                      </a>
                    }
                  />
                </div>
                {park.detailUrl ? (
                  <a className={styles.siteLink} href={park.detailUrl} rel="noreferrer" target="_blank">
                    Official park page
                  </a>
                ) : null}
              </div>

              {park.poolDetails ? (
                <>
                  <div className={styles.section}>
                    <SectionTitle>Pool Hours</SectionTitle>
                    <div className={styles.infoGrid}>
                      <InfoRow
                        eyebrow="Today"
                        value={
                          <span className={styles.iconLine}>
                            <Clock3 size={16} />
                            {park.poolDetails.todayHours}
                          </span>
                        }
                      />
                      <InfoRow eyebrow="Season" value={park.poolDetails.seasonLabel} />
                    </div>
                  </div>

                  <div className={styles.section}>
                    <SectionTitle>Weekly Pool Schedule</SectionTitle>
                    <HoursPanel rows={park.poolDetails.weeklyHours} />
                  </div>

                  <div className={styles.section}>
                    <SectionTitle>Programs</SectionTitle>
                    <div className={styles.programs}>
                      <InfoRow
                        eyebrow="Swim lessons"
                        value={
                          <span className={styles.iconLine}>
                            <GraduationCap size={16} />
                            {park.poolDetails.lessonsSummary}
                          </span>
                        }
                      />
                      <InfoRow
                        eyebrow="Splash pads"
                        value={
                          <span className={styles.iconLine}>
                            <Waves size={16} />
                            {park.poolDetails.splashPadSummary}
                          </span>
                        }
                      />
                    </div>
                  </div>

                  {park.poolDetails.note ? <p className={styles.note}>{park.poolDetails.note}</p> : null}
                </>
              ) : null}

              {park.description ? (
                <div className={styles.section}>
                  <SectionTitle>About</SectionTitle>
                  <p className={styles.description}>{park.description}</p>
                </div>
              ) : null}

              <ParkCommunityPanel
                isAuthenticated={isAuthenticated}
                onCheckIn={isAuthenticated ? onCheckIn : onOpenAccount}
                onComment={(body) => {
                  if (!isAuthenticated) {
                    onOpenAccount();
                    return;
                  }

                  onComment(body);
                }}
                onOpenReport={isAuthenticated ? onOpenReport : onOpenAccount}
                park={park}
              />
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Select a park or pool marker to load the info drawer, or drag the handle upward to open it.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
