import { useEffect, useRef, useState } from 'react';
import { CoachCallout } from '../../molecules/CoachCallout/CoachCallout';
import type { ActiveFeatureCoachTip } from '../../../features/onboarding/useFeatureCoach';
import styles from './FeatureCoach.module.css';

interface FeatureCoachProps {
  tip: ActiveFeatureCoachTip | null;
  onDismiss: () => void;
}

interface CoachLayout {
  bubbleLeft: number;
  bubbleTop: number;
  highlight: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  placement: 'above' | 'below';
}

export const FeatureCoach = ({ tip, onDismiss }: FeatureCoachProps) => {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<CoachLayout | null>(null);

  useEffect(() => {
    if (!tip) {
      setLayout(null);
      return;
    }

    const selector = `[data-feature-coach="${tip.targetId}"]`;
    let frameId = 0;

    const updateLayout = () => {
      const target = document.querySelector<HTMLElement>(selector);
      const bubble = bubbleRef.current;

      if (!target || !bubble) {
        setLayout(null);
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const safeInset = 12;
      const gap = 14;
      const maxLeft = window.innerWidth - bubbleRect.width - safeInset;
      const preferredLeft = targetRect.left + targetRect.width / 2 - bubbleRect.width / 2;
      const bubbleLeft = Math.min(Math.max(preferredLeft, safeInset), Math.max(safeInset, maxLeft));

      let placement: CoachLayout['placement'] = 'below';
      let bubbleTop = targetRect.bottom + gap;

      if (bubbleTop + bubbleRect.height > window.innerHeight - safeInset) {
        const aboveTop = targetRect.top - bubbleRect.height - gap;

        if (aboveTop >= safeInset) {
          placement = 'above';
          bubbleTop = aboveTop;
        } else {
          bubbleTop = Math.max(safeInset, window.innerHeight - bubbleRect.height - safeInset);
        }
      }

      setLayout({
        bubbleLeft,
        bubbleTop,
        placement,
        highlight: {
          left: Math.max(safeInset, targetRect.left - 6),
          top: Math.max(safeInset, targetRect.top - 6),
          width: targetRect.width + 12,
          height: targetRect.height + 12
        }
      });
    };

    const scheduleLayout = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateLayout);
    };

    scheduleLayout();

    const target = document.querySelector<HTMLElement>(selector);
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            scheduleLayout();
          })
        : null;

    if (target && observer) {
      observer.observe(target);
    }

    if (bubbleRef.current && observer) {
      observer.observe(bubbleRef.current);
    }

    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('scroll', scheduleLayout, true);

    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener('resize', scheduleLayout);
      window.removeEventListener('scroll', scheduleLayout, true);
    };
  }, [tip]);

  if (!tip) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      {layout ? (
        <div
          className={styles.highlight}
          style={{
            height: `${layout.highlight.height}px`,
            left: `${layout.highlight.left}px`,
            top: `${layout.highlight.top}px`,
            width: `${layout.highlight.width}px`
          }}
        />
      ) : null}
      <div
        className={`${styles.bubble} ${layout?.placement === 'above' ? styles.above : styles.below}`}
        ref={bubbleRef}
        style={{
          left: `${layout?.bubbleLeft ?? 12}px`,
          top: `${layout?.bubbleTop ?? 12}px`,
          visibility: layout ? 'visible' : 'hidden'
        }}
      >
        <CoachCallout
          body={tip.body}
          onDismiss={onDismiss}
          stepIndex={tip.stepIndex}
          title={tip.title}
          totalSteps={tip.totalSteps}
        />
      </div>
    </div>
  );
};
