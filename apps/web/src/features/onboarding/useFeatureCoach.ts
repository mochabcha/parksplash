import { useEffect, useState } from 'react';

export type FeatureCoachTargetId = 'park-browser' | 'filters' | 'park-drawer' | 'reporting';

type FeatureCoachTipId = FeatureCoachTargetId;

interface FeatureCoachAvailability {
  hasSelectedPark: boolean;
}

interface FeatureCoachStep {
  id: FeatureCoachTipId;
  targetId: FeatureCoachTargetId;
  title: string;
  body: string;
  minActionCount: number;
  isAvailable?: (availability: FeatureCoachAvailability) => boolean;
}

export interface ActiveFeatureCoachTip {
  id: FeatureCoachTipId;
  targetId: FeatureCoachTargetId;
  title: string;
  body: string;
  stepIndex: number;
  totalSteps: number;
}

interface FeatureCoachState {
  actionCount: number;
  shownTipIds: FeatureCoachTipId[];
}

const STORAGE_KEY = 'parksplash-feature-coach';

const coachSteps: FeatureCoachStep[] = [
  {
    id: 'park-browser',
    targetId: 'park-browser',
    title: 'Keep the full park list nearby',
    body: 'Open the browser whenever you want to jump between map markers and the full park directory without losing your place.',
    minActionCount: 1
  },
  {
    id: 'filters',
    targetId: 'filters',
    title: 'Trim the map fast',
    body: 'Quick filters and amenity chips are the fastest way to narrow the map to splash pads, pool sites, or the parks closest to you.',
    minActionCount: 4
  },
  {
    id: 'park-drawer',
    targetId: 'park-drawer',
    title: 'The detail drawer is the real park view',
    body: 'When a park is selected, this drawer is where hours, amenities, pool notes, and community updates stack together.',
    minActionCount: 7,
    isAvailable: ({ hasSelectedPark }) => hasSelectedPark
  },
  {
    id: 'reporting',
    targetId: 'reporting',
    title: 'Help keep the map fresh',
    body: 'Reports and check-ins make the map more useful for the next family deciding where to go today.',
    minActionCount: 10
  }
];

const defaultState: FeatureCoachState = {
  actionCount: 0,
  shownTipIds: []
};

const readState = (): FeatureCoachState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<FeatureCoachState>;

    return {
      actionCount: typeof parsed.actionCount === 'number' ? parsed.actionCount : 0,
      shownTipIds: Array.isArray(parsed.shownTipIds) ? parsed.shownTipIds.filter(Boolean) as FeatureCoachTipId[] : []
    };
  } catch {
    return defaultState;
  }
};

export const useFeatureCoach = (availability: FeatureCoachAvailability) => {
  const [coachState, setCoachState] = useState<FeatureCoachState>(readState);
  const [activeTipId, setActiveTipId] = useState<FeatureCoachTipId | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coachState));
  }, [coachState]);

  useEffect(() => {
    if (activeTipId) {
      return;
    }

    const nextStep = coachSteps.find(
      (step) =>
        coachState.actionCount >= step.minActionCount &&
        !coachState.shownTipIds.includes(step.id) &&
        (step.isAvailable?.(availability) ?? true)
    );

    if (!nextStep) {
      return;
    }

    setActiveTipId(nextStep.id);
    setCoachState((currentState) =>
      currentState.shownTipIds.includes(nextStep.id)
        ? currentState
        : {
            ...currentState,
            shownTipIds: [...currentState.shownTipIds, nextStep.id]
          }
    );
  }, [activeTipId, availability, coachState.actionCount, coachState.shownTipIds]);

  const activeStep = activeTipId ? coachSteps.find((step) => step.id === activeTipId) : undefined;

  return {
    activeTip: activeStep
      ? {
          ...activeStep,
          stepIndex: coachSteps.findIndex((step) => step.id === activeStep.id) + 1,
          totalSteps: coachSteps.length
        }
      : null,
    dismissActiveTip: () => setActiveTipId(null),
    recordAction: () =>
      setCoachState((currentState) => ({
        ...currentState,
        actionCount: currentState.actionCount + 1
      }))
  } satisfies {
    activeTip: ActiveFeatureCoachTip | null;
    dismissActiveTip: () => void;
    recordAction: () => void;
  };
};
