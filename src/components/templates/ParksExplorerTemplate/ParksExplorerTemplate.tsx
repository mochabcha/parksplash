import { AppDialog } from '../../organisms/AppDialog/AppDialog';
import { AppToast } from '../../organisms/AppToast/AppToast';
import { ExplorerFrame } from '../../organisms/ExplorerFrame/ExplorerFrame';
import { MapActionDock } from '../../organisms/MapActionDock/MapActionDock';
import { MapTopBar } from '../../organisms/MapTopBar/MapTopBar';
import { ParkDrawer } from '../../organisms/ParkDrawer/ParkDrawer';
import { ParkMap } from '../../organisms/ParkMap/ParkMap';
import { ParkSidePanel } from '../../organisms/ParkSidePanel/ParkSidePanel';
import { parkGuideSections } from '../../../content/parks/guideContent';
import type { ParkViewModel, AmenityFilterOption } from '../../../domain/parks/park.types';
import type { AppDialog as AppDialogType, ParkQuickFilter } from '../../../features/park-explorer/useParkExplorer';
import type { ThemeMode } from '../../../features/theme/useThemeMode';
import styles from './ParksExplorerTemplate.module.css';

interface ParksExplorerTemplateProps {
  parks: ParkViewModel[];
  filteredParks: ParkViewModel[];
  amenityOptions: AmenityFilterOption[];
  selectedPark?: ParkViewModel;
  activeQuickFilter: ParkQuickFilter;
  selectedAmenityKeys: string[];
  setActiveQuickFilter: (filter: ParkQuickFilter) => void;
  toggleAmenityFilter: (amenityKey: string) => void;
  clearAmenityFilters: () => void;
  openParkFromMap: (parkId: string) => void;
  openParkFromBrowser: (parkId: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  isDrawerExpanded: boolean;
  isSidePanelOpen: boolean;
  toggleSidePanel: () => void;
  closeSidePanel: () => void;
  activeDialog: AppDialogType;
  openDialog: (dialog: AppDialogType) => void;
  closeDialog: () => void;
  toast: {
    id: number;
    message: string;
  } | null;
  recenterSignal: number;
  recenterMap: () => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  metrics: {
    totalParks: number;
    visibleParks: number;
    poolSites: number;
    visiblePoolSites: number;
    splashPads: number;
  };
}

export const ParksExplorerTemplate = ({
  filteredParks,
  amenityOptions,
  selectedPark,
  activeQuickFilter,
  selectedAmenityKeys,
  setActiveQuickFilter,
  toggleAmenityFilter,
  clearAmenityFilters,
  openParkFromMap,
  openParkFromBrowser,
  openDrawer,
  closeDrawer,
  isDrawerExpanded,
  isSidePanelOpen,
  toggleSidePanel,
  closeSidePanel,
  activeDialog,
  openDialog,
  closeDialog,
  toast,
  recenterSignal,
  recenterMap,
  themeMode,
  toggleTheme,
  metrics,
}: ParksExplorerTemplateProps) => (
  <ExplorerFrame>
    <main className={styles.screen}>
      <div className={styles.mapLayer}>
        <ParkMap
          isDrawerExpanded={isDrawerExpanded}
          onSelectPark={openParkFromMap}
          parks={filteredParks}
          recenterSignal={recenterSignal}
          selectedParkId={selectedPark?.id}
        />
      </div>
      <MapTopBar
        activeQuickFilter={activeQuickFilter}
        onCenterMap={recenterMap}
        onMenuToggle={toggleSidePanel}
        selectedAmenityCount={selectedAmenityKeys.length}
        totalParks={metrics.totalParks}
        visibleParks={metrics.visibleParks}
        visiblePoolSites={metrics.visiblePoolSites}
      />
      <ParkSidePanel
        activeQuickFilter={activeQuickFilter}
        amenityOptions={amenityOptions}
        isOpen={isSidePanelOpen}
        onAmenityToggle={toggleAmenityFilter}
        onClearAmenities={clearAmenityFilters}
        onClose={closeSidePanel}
        onQuickFilterChange={setActiveQuickFilter}
        onSelectPark={openParkFromBrowser}
        parks={filteredParks}
        selectedAmenityKeys={selectedAmenityKeys}
        selectedParkId={selectedPark?.id}
      />
      <MapActionDock
        onOpenGuide={() => openDialog('park-guide')}
        onToggleTheme={toggleTheme}
        themeMode={themeMode}
      />
      <ParkDrawer
        isExpanded={isDrawerExpanded}
        onClose={closeDrawer}
        onOpen={openDrawer}
        park={selectedPark}
      />
      <AppToast toast={toast} />
      <AppDialog
        actions={[{ label: 'Close', onClick: closeDialog }]}
        isOpen={activeDialog === 'park-guide'}
        onClose={closeDialog}
        sections={parkGuideSections}
        title="Parks and pools guide"
      />
    </main>
  </ExplorerFrame>
);
