import { useEffect, useMemo, useState } from 'react';
import type { AuthUserDto } from '@parksplash/shared';

const STORAGE_KEY = 'parksplash-love-offering-unlocked';
const VIEWED_KEY = 'parksplash-viewed-park-ids';

const getInitialUnlocked = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true';
};

const getViewedParkIds = () => {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  const stored = window.localStorage.getItem(VIEWED_KEY);
  return new Set<string>(stored ? (JSON.parse(stored) as string[]) : []);
};

export const useLoveOfferingGate = (user: AuthUserDto | null) => {
  const [isUnlocked, setIsUnlocked] = useState(() => Boolean(user?.donationGateUnlocked) || getInitialUnlocked());
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'google-maps' | 'park-limit'>('park-limit');
  const [parkId, setParkId] = useState<string | undefined>();
  const [viewedIds, setViewedIds] = useState<Set<string>>(getViewedParkIds);

  const viewedCount = useMemo(() => viewedIds.size, [viewedIds]);

  useEffect(() => {
    if (user?.donationGateUnlocked) {
      setIsUnlocked(true);
    }
  }, [user?.donationGateUnlocked]);

  const persistUnlock = () => {
    setIsUnlocked(true);
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const trackViewedPark = (nextParkId: string) => {
    if (isUnlocked) {
      return false;
    }

    const next = new Set(viewedIds);
    next.add(nextParkId);
    setViewedIds(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEWED_KEY, JSON.stringify([...next]));
    }

    if (next.size > 5) {
      setTriggerSource('park-limit');
      setParkId(nextParkId);
      setIsOpen(true);
      return true;
    }

    return false;
  };

  const interceptGoogleMaps = (nextParkId?: string) => {
    if (isUnlocked) {
      return false;
    }

    setTriggerSource('google-maps');
    setParkId(nextParkId);
    setIsOpen(true);
    return true;
  };

  return {
    isUnlocked,
    isOpen,
    triggerSource,
    parkId,
    viewedCount,
    open: (source: 'google-maps' | 'park-limit', nextParkId?: string) => {
      setTriggerSource(source);
      setParkId(nextParkId);
      setIsOpen(true);
    },
    close: () => {
      if (isUnlocked) {
        setIsOpen(false);
      }
    },
    persistUnlock,
    trackViewedPark,
    interceptGoogleMaps
  };
};
