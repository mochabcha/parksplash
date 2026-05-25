import type { DailyHours, OpeningPlan, PoolStatus, PoolViewModel } from './pool.types';

export const OUTDOOR_POOL_CENTER: [number, number] = [30.3322, -81.6557];

const YEAR_LABEL = '2026';
const MEMORIAL_DAY_KEY = '05-25';
const PRESEASON_START_KEY = '05-23';
const PRESEASON_END_KEY = '05-31';
const REGULAR_SEASON_START_KEY = '06-06';
const REGULAR_SEASON_END_KEY = '08-02';
const JULY_OPENING_KEY = '07-01';
const HOLIDAY_KEYS = new Set(['06-19', '07-04']);

const CITY_LESSON_SUMMARY =
  'Summer learn-to-swim sessions run June 8 to July 30, Monday through Thursday, $60 per two-week session.';
const SPLASH_PAD_SUMMARY =
  'City splash pads open daily 10AM to 7PM from May 9 through the last weekend in October. The source did not list this pool as a splash pad site.';

const REGULAR_PATRON_HOURS_NOTE =
  'Regular patron hours shift to 1PM to 6PM during the learn-to-swim program window that begins June 8.';

const compareKeys = (left: string, right: string) => left.localeCompare(right);

const formatKey = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatClock = (hour: number, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatWindow = (startHour: number, endHour: number, endMinute = 0) =>
  `${formatClock(startHour)} to ${formatClock(endHour, endMinute)}`;

const isWeekendOnlySeason = (key: string) =>
  compareKeys(key, PRESEASON_START_KEY) >= 0 && compareKeys(key, PRESEASON_END_KEY) <= 0;

const isRegularSeason = (key: string) =>
  compareKeys(key, REGULAR_SEASON_START_KEY) >= 0 && compareKeys(key, REGULAR_SEASON_END_KEY) <= 0;

const isAfterSeason = (key: string) => compareKeys(key, REGULAR_SEASON_END_KEY) > 0;

const isBeforeSeason = (key: string) => compareKeys(key, PRESEASON_START_KEY) < 0;

const getOutdoorWindow = (date: Date, openingPlan: OpeningPlan) => {
  const day = date.getDay();
  const key = formatKey(date);

  if (openingPlan === 'july' && compareKeys(key, JULY_OPENING_KEY) < 0) {
    return null;
  }

  if (HOLIDAY_KEYS.has(key)) {
    return {
      openHour: 11,
      closeHour: 18,
      closeMinute: 0,
      label: 'Holiday',
    };
  }

  if (isWeekendOnlySeason(key)) {
    if (day === 6) {
      return { openHour: 11, closeHour: 18, closeMinute: 0, label: 'Saturday' };
    }

    if (day === 0) {
      return { openHour: 14, closeHour: 18, closeMinute: 0, label: 'Sunday' };
    }

    return null;
  }

  if (isRegularSeason(key)) {
    if (day >= 1 && day <= 5) {
      return { openHour: 13, closeHour: 19, closeMinute: 0, label: 'Weekday' };
    }

    if (day === 6) {
      return { openHour: 11, closeHour: 18, closeMinute: 0, label: 'Saturday' };
    }

    return { openHour: 14, closeHour: 18, closeMinute: 0, label: 'Sunday' };
  }

  return null;
};

const getCecilWindow = (date: Date) => {
  const day = date.getDay();

  if (day >= 1 && day <= 5) {
    return [
      {
        label: 'Lap swim',
        openHour: 7,
        closeHour: 8,
      },
      {
        label: 'Open swim',
        openHour: 8,
        closeHour: 10,
      },
      {
        label: 'Open swim',
        openHour: 13,
        closeHour: 18,
      },
    ];
  }

  if (day === 6) {
    return [
      {
        label: 'Open swim',
        openHour: 9,
        closeHour: 12,
      },
      {
        label: 'Open swim',
        openHour: 13,
        closeHour: 18,
      },
    ];
  }

  return [
    {
      label: 'Open swim',
      openHour: 13,
      closeHour: 18,
    },
  ];
};

const getTodayHoursLabel = (name: string, date: Date, openingPlan: OpeningPlan) => {
  if (name === 'Cecil Aquatic Center') {
    const windows = getCecilWindow(date);
    return windows.map((window) => `${window.label} ${formatWindow(window.openHour, window.closeHour)}`).join(' • ');
  }

  const window = getOutdoorWindow(date, openingPlan);
  return window ? formatWindow(window.openHour, window.closeHour, window.closeMinute) : 'Closed today';
};

const getSeasonLabel = (openingPlan: OpeningPlan) =>
  openingPlan === 'july' ? `Opens in July ${YEAR_LABEL}` : `Pre-season and regular season ${YEAR_LABEL}`;

const getWeeklyHours = (name: string, openingPlan: OpeningPlan): DailyHours[] => {
  if (name === 'Cecil Aquatic Center') {
    return [
      {
        label: 'Mon-Fri',
        hours: 'Lap 7AM-8AM • Open Swim 8AM-10AM • Open Swim 1PM-6PM',
        note: 'Swim lessons 10AM-12PM and 6PM-8PM are closed to non-members.',
      },
      {
        label: 'Saturday',
        hours: 'Open Swim 9AM-12PM • Open Swim 1PM-6PM',
        note: 'Maintenance break 12PM-1PM.',
      },
      {
        label: 'Sunday',
        hours: 'Open Swim 1PM-6PM',
      },
    ];
  }

  const openingDayNote =
    openingPlan === 'july' ? 'Site is scheduled to open in July.' : 'Memorial Day weekend opens Saturday May 23.';

  return [
    {
      label: 'Pre-season Saturday',
      hours: '11AM-6PM',
      note: openingDayNote,
    },
    {
      label: 'Pre-season Sunday',
      hours: '2PM-6PM',
    },
    {
      label: 'Regular Mon-Fri',
      hours: '1PM-7PM',
      note: REGULAR_PATRON_HOURS_NOTE,
    },
    {
      label: 'Regular Saturday',
      hours: '11AM-6PM',
    },
    {
      label: 'Regular Sunday',
      hours: '2PM-6PM',
    },
  ];
};

const getLessonsSummary = (name: string) =>
  name === 'Cecil Aquatic Center'
    ? 'On-site lessons run weekdays 10AM-12PM and 6PM-8PM during summer operations. Non-members cannot use those lesson blocks.'
    : CITY_LESSON_SUMMARY;

const getAmenities = (name: string, openingPlan: OpeningPlan) => {
  const amenities = ['Outdoor pool'];

  if (name === 'Cecil Aquatic Center') {
    amenities.push('Lap swim', 'On-site lessons');
  } else {
    amenities.push('City swim lessons');
  }

  if (openingPlan === 'july') {
    amenities.push('July opening');
  } else {
    amenities.push('Pre-season site');
  }

  amenities.push('Splash pad info');

  return amenities;
};

const getPoolStatus = (
  name: string,
  date: Date,
  openingPlan: OpeningPlan,
): PoolStatus => {
  const key = formatKey(date);

  if (openingPlan === 'july' && compareKeys(key, JULY_OPENING_KEY) < 0) {
    return {
      state: 'future-opening',
      headline: 'Scheduled to open in July',
      detail: 'This site is listed as an additional opening later in the season.',
      accentLabel: 'July opening',
    };
  }

  if (isBeforeSeason(key)) {
    return {
      state: 'future-opening',
      headline: 'Season has not started yet',
      detail: `Outdoor pool operations begin Memorial Day weekend ${YEAR_LABEL}.`,
      accentLabel: 'Opens May 23',
    };
  }

  if (isAfterSeason(key)) {
    return {
      state: 'season-ended',
      headline: 'Outdoor pool season has ended',
      detail: `Regular outdoor hours end after August 2, ${YEAR_LABEL}.`,
      accentLabel: 'Season ended',
    };
  }

  if (name === 'Cecil Aquatic Center') {
    const nowMinutes = date.getHours() * 60 + date.getMinutes();
    const windows = getCecilWindow(date);

    const activeWindow = windows.find((window) => {
      const startMinutes = window.openHour * 60;
      const endMinutes = window.closeHour * 60;
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    });

    if (activeWindow) {
      return {
        state: 'open-now',
        headline: `${activeWindow.label} is live now`,
        detail: `Today's next close is ${formatClock(activeWindow.closeHour)}.`,
        accentLabel: 'Open now',
      };
    }

    const upcoming = windows.find((window) => nowMinutes < window.openHour * 60);

    if (upcoming) {
      return {
        state: 'opens-later',
        headline: `${upcoming.label} starts later today`,
        detail: `Next swim block opens at ${formatClock(upcoming.openHour)}.`,
        accentLabel: 'Opens later',
      };
    }

    return {
      state: 'closed-now',
      headline: 'Closed for the rest of today',
      detail: 'Cecil reopens on its next scheduled swim block.',
      accentLabel: 'Closed now',
    };
  }

  const window = getOutdoorWindow(date, openingPlan);

  if (!window) {
    const detail =
      isWeekendOnlySeason(key)
        ? 'This site is in weekend-only pre-season mode right now.'
        : 'This site is between scheduled swim windows today.';

    return {
      state: 'closed-now',
      headline: 'Closed today',
      detail,
      accentLabel: 'Closed today',
    };
  }

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const openMinutes = window.openHour * 60;
  const closeMinutes = window.closeHour * 60 + window.closeMinute;

  if (nowMinutes < openMinutes) {
    return {
      state: 'opens-later',
      headline: `Opens later today at ${formatClock(window.openHour)}`,
      detail: `${window.label} schedule runs ${formatWindow(window.openHour, window.closeHour)}.`,
      accentLabel: 'Opens later',
    };
  }

  if (nowMinutes >= closeMinutes) {
    return {
      state: 'closed-now',
      headline: 'Closed for the day',
      detail: `${window.label} swim window ended at ${formatClock(window.closeHour)}.`,
      accentLabel: 'Closed now',
    };
  }

  return {
    state: 'open-now',
    headline: 'Open right now',
    detail: `Today's swim window runs until ${formatClock(window.closeHour)}.`,
    accentLabel: 'Open now',
  };
};

export const buildPoolViewModel = <
  T extends {
    name: string;
    openingPlan: OpeningPlan;
  },
>(
  pool: T,
  date = new Date(),
): Pick<
  PoolViewModel,
  | 'todayHours'
  | 'nextWindow'
  | 'seasonLabel'
  | 'status'
  | 'amenities'
  | 'weeklyHours'
  | 'lessonsSummary'
  | 'splashPadSummary'
  | 'note'
> => {
  const weeklyHours = getWeeklyHours(pool.name, pool.openingPlan);
  const status = getPoolStatus(pool.name, date, pool.openingPlan);

  return {
    todayHours: getTodayHoursLabel(pool.name, date, pool.openingPlan),
    nextWindow: weeklyHours[0]?.hours ?? 'Schedule unavailable',
    seasonLabel: getSeasonLabel(pool.openingPlan),
    status,
    amenities: getAmenities(pool.name, pool.openingPlan),
    weeklyHours,
    lessonsSummary: getLessonsSummary(pool.name),
    splashPadSummary: SPLASH_PAD_SUMMARY,
    note:
      pool.name === 'Cecil Aquatic Center'
        ? 'Maintenance break runs 12PM to 1PM on weekdays and Saturdays.'
        : pool.openingPlan === 'july'
          ? 'This pool is listed separately as a July opening.'
          : undefined,
  };
};
