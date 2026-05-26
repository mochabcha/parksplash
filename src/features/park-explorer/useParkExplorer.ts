import { useEffect, useMemo, useState } from 'react';
import { buildAmenityFilterOptions } from '../../domain/parks/parkAmenities';
import { getParkAmenityMap } from '../../domain/parks/parkDirectory';
import type { AmenityFilterOption, ParkViewModel } from '../../domain/parks/park.types';

export type ParkQuickFilter =
  | 'all'
  | 'pool-sites'
  | 'open-now'
  | 'swim-lessons'
  | 'splash-pads'
  | 'playgrounds'
  | 'trails'
  | 'sports'
  | 'boat-access'
  | 'picnic'
  | 'community-centers'
  | 'accessible'
  | 'dog-parks';
export type AppDialog = 'park-guide' | null;
export type ParkBrowserTab = 'parks' | 'quick-filters' | 'amenities';

const amenityMap = getParkAmenityMap();
const sportsAmenityKeys = [
  'baseball',
  'basketball',
  'football',
  'soccer',
  'tennis',
  'pickleball',
  'multipurposefield',
  'skate',
  'golf',
  'workoutstation',
  'fitnessequipment',
  'equestrian',
];
const trailAmenityKeys = ['hikingtrail', 'biketrail', 'birding', 'riverwalk', 'scenic'];
const boatAmenityKeys = [
  'onwater',
  'boatramp',
  'boatdock',
  'boattrailerparking',
  'nonmotorizedlaunch',
  'shorelaunch',
  'fishingpier',
  'beachpier',
  'kayakrental',
  'canoe',
  'canoerental',
  'paddleboard',
  'paddleboat',
  'boatpump',
  'baittackle',
  'pwc',
  'pwcrental',
  'sailboatrental',
  'surfing',
];
const picnicAmenityKeys = ['picnictables', 'picnicshelters', 'grills'];

const hasAnyAmenity = (park: ParkViewModel, keys: string[]) => keys.some((key) => park.amenityKeys.includes(key));

const matchesQuickFilter = (park: ParkViewModel, filter: ParkQuickFilter) => {
  switch (filter) {
    case 'pool-sites':
      return park.hasPool;
    case 'open-now':
      return park.poolDetails?.status.state === 'open-now';
    case 'swim-lessons':
      return Boolean(park.poolDetails);
    case 'splash-pads':
      return park.hasSplashPad;
    case 'playgrounds':
      return park.amenityKeys.includes('playground');
    case 'trails':
      return hasAnyAmenity(park, trailAmenityKeys);
    case 'sports':
      return hasAnyAmenity(park, sportsAmenityKeys);
    case 'boat-access':
      return hasAnyAmenity(park, boatAmenityKeys);
    case 'picnic':
      return hasAnyAmenity(park, picnicAmenityKeys);
    case 'community-centers':
      return park.amenityKeys.includes('communitycenter');
    case 'accessible':
      return park.amenityKeys.includes('wheelchair') || park.amenityKeys.includes('accessibleamenities');
    case 'dog-parks':
      return park.amenityKeys.includes('dogpark');
    default:
      return true;
  }
};

const matchesAmenityFilters = (park: ParkViewModel, selectedAmenityKeys: string[]) =>
  selectedAmenityKeys.every((key) => park.amenityKeys.includes(key));

export const useParkExplorer = (parks: ParkViewModel[]) => {
  const [activeQuickFilter, setActiveQuickFilter] = useState<ParkQuickFilter>('all');
  const [selectedAmenityKeys, setSelectedAmenityKeys] = useState<string[]>([]);
  const [selectedParkId, setSelectedParkId] = useState<string>('');
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelTab, setSidePanelTab] = useState<ParkBrowserTab>('parks');
  const [activeDialog, setActiveDialog] = useState<AppDialog>(null);
  const [recenterSignal, setRecenterSignal] = useState(0);

  const amenityOptions = useMemo<AmenityFilterOption[]>(
    () => buildAmenityFilterOptions(parks, amenityMap),
    [parks],
  );

  const filteredParks = useMemo(() => {
    if (activeQuickFilter === 'all' && selectedAmenityKeys.length === 0) {
      return parks;
    }

    return parks.filter(
      (park) =>
        matchesQuickFilter(park, activeQuickFilter) &&
        matchesAmenityFilters(park, selectedAmenityKeys),
    );
  }, [activeQuickFilter, parks, selectedAmenityKeys]);

  const selectedPark = useMemo(
    () =>
      filteredParks.find((park) => park.id === selectedParkId) ??
      parks.find((park) => park.id === selectedParkId) ??
      undefined,
    [filteredParks, parks, selectedParkId],
  );

  const clearFocusedPark = () => {
    setSelectedParkId('');
    setIsDrawerExpanded(false);
  };

  useEffect(() => {
    if (selectedPark && !filteredParks.some((park) => park.id === selectedPark.id)) {
      clearFocusedPark();
    }
  }, [filteredParks, selectedPark]);

  const handleQuickFilterChange = (filter: ParkQuickFilter) => {
    clearFocusedPark();
    setActiveQuickFilter(filter);
    setRecenterSignal((value) => value + 1);
  };

  const toggleAmenityFilter = (amenityKey: string) => {
    clearFocusedPark();
    setSelectedAmenityKeys((currentKeys) =>
      currentKeys.includes(amenityKey)
        ? currentKeys.filter((key) => key !== amenityKey)
        : [...currentKeys, amenityKey],
    );
    setRecenterSignal((value) => value + 1);
  };

  const clearAmenityFilters = () => {
    clearFocusedPark();
    setSelectedAmenityKeys([]);
    setRecenterSignal((value) => value + 1);
  };

  const openPark = (parkId: string) => {
    setSelectedParkId(parkId);
    setIsDrawerExpanded(true);
    setIsSidePanelOpen(false);
    setSidePanelTab('parks');
  };

  const openDrawer = () => {
    if (!selectedParkId) {
      return;
    }

    setIsDrawerExpanded(true);
  };

  const recenterMap = () => {
    clearFocusedPark();
    setRecenterSignal((value) => value + 1);
  };

  return {
    parks,
    filteredParks,
    amenityOptions,
    selectedPark,
    activeQuickFilter,
    selectedAmenityKeys,
    sidePanelTab,
    isDrawerExpanded,
    isSidePanelOpen,
    activeDialog,
    toast: null,
    recenterSignal,
    setActiveQuickFilter: handleQuickFilterChange,
    toggleAmenityFilter,
    clearAmenityFilters,
    openParkFromMap: openPark,
    openParkFromBrowser: openPark,
    openDrawer,
    closeDrawer: () => setIsDrawerExpanded(false),
    toggleSidePanel: () => {
      setSidePanelTab('parks');
      setIsSidePanelOpen((value) => !value);
    },
    openSidePanelTab: (tab: ParkBrowserTab) => {
      setSidePanelTab(tab);
      setIsSidePanelOpen(true);
    },
    setSidePanelTab,
    closeSidePanel: () => setIsSidePanelOpen(false),
    openDialog: (dialog: AppDialog) => setActiveDialog(dialog),
    closeDialog: () => setActiveDialog(null),
    recenterMap,
    metrics: {
      totalParks: parks.length,
      visibleParks: filteredParks.length,
      poolSites: parks.filter((park) => park.hasPool).length,
      visiblePoolSites: filteredParks.filter((park) => park.hasPool).length,
      splashPads: parks.filter((park) => park.hasSplashPad).length,
    },
  };
};
