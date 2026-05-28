import type { AuthUserDto } from '@parksplash/shared';
import { AppDialog } from '../../organisms/AppDialog/AppDialog';
import { AccountDialog } from '../../organisms/AccountDialog/AccountDialog';
import { AppToast } from '../../organisms/AppToast/AppToast';
import { ExplorerFrame } from '../../organisms/ExplorerFrame/ExplorerFrame';
import { LoveOfferingDialog } from '../../organisms/LoveOfferingDialog/LoveOfferingDialog';
import { MapActionDock } from '../../organisms/MapActionDock/MapActionDock';
import { MapTopBar } from '../../organisms/MapTopBar/MapTopBar';
import { ParkDrawer } from '../../organisms/ParkDrawer/ParkDrawer';
import { ParkMap } from '../../organisms/ParkMap/ParkMap';
import { ParkSidePanel } from '../../organisms/ParkSidePanel/ParkSidePanel';
import { ReportComposer } from '../../organisms/ReportComposer/ReportComposer';
import { parkGuideSections } from '../../../content/parks/guideContent';
import type { ParkViewModel, AmenityFilterOption } from '../../../domain/parks/park.types';
import type {
  AppDialog as AppDialogType,
  ParkBrowserTab,
  ParkQuickFilter,
} from '../../../features/park-explorer/useParkExplorer';
import type { ThemeMode } from '../../../features/theme/useThemeMode';
import styles from './ParksExplorerTemplate.module.css';

interface ParksExplorerTemplateProps {
  parks: ParkViewModel[];
  filteredParks: ParkViewModel[];
  amenityOptions: AmenityFilterOption[];
  selectedPark?: ParkViewModel;
  activeQuickFilter: ParkQuickFilter;
  selectedAmenityKeys: string[];
  sidePanelTab: ParkBrowserTab;
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
  openSidePanelTab: (tab: ParkBrowserTab) => void;
  setSidePanelTab: (tab: ParkBrowserTab) => void;
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
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  auth: {
    user: AuthUserDto | null;
    authError: string;
    isAccountOpen: boolean;
    openAccount: () => void;
    closeAccount: () => void;
    signIn: (input: { email: string; password: string }) => Promise<void>;
    signUp: (input: { email: string; password: string; displayName: string }) => Promise<void>;
    signOut: () => Promise<void>;
  };
  reporting: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    submit: (input: Record<string, unknown>) => Promise<void>;
  };
  loveOffering: {
    isOpen: boolean;
    triggerSource: 'google-maps' | 'park-limit';
    submit: (input: { amount: number; email: string }) => Promise<void>;
  };
  onOpenMaps: (park: ParkViewModel) => void;
  onComment: (body: string) => void;
  onCheckIn: () => void;
}

export const ParksExplorerTemplate = ({
  filteredParks,
  amenityOptions,
  selectedPark,
  activeQuickFilter,
  selectedAmenityKeys,
  sidePanelTab,
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
  openSidePanelTab,
  setSidePanelTab,
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
  userLocation,
  auth,
  reporting,
  loveOffering,
  onOpenMaps,
  onComment,
  onCheckIn,
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
          userLocation={userLocation}
        />
      </div>
      <MapTopBar
        activeQuickFilter={activeQuickFilter}
        onCenterMap={recenterMap}
        onFilterToggle={() => openSidePanelTab('quick-filters')}
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
        onTabChange={setSidePanelTab}
        parks={filteredParks}
        sidePanelTab={sidePanelTab}
        selectedAmenityKeys={selectedAmenityKeys}
        selectedParkId={selectedPark?.id}
      />
      <MapActionDock
        onOpenAccount={auth.openAccount}
        onOpenGuide={() => openDialog('park-guide')}
        onOpenReport={reporting.open}
        onToggleTheme={toggleTheme}
        themeMode={themeMode}
      />
      <ParkDrawer
        isExpanded={isDrawerExpanded}
        isAuthenticated={Boolean(auth.user)}
        onCheckIn={onCheckIn}
        onComment={onComment}
        onClose={closeDrawer}
        onOpenAccount={auth.openAccount}
        onOpen={openDrawer}
        onOpenMaps={onOpenMaps}
        onOpenReport={reporting.open}
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
      <AccountDialog
        authError={auth.authError}
        isOpen={auth.isAccountOpen}
        onClose={auth.closeAccount}
        onSignIn={auth.signIn}
        onSignOut={auth.signOut}
        onSignUp={auth.signUp}
        user={auth.user}
      />
      <ReportComposer isOpen={reporting.isOpen} onClose={reporting.close} onSubmit={reporting.submit} park={selectedPark} />
      <LoveOfferingDialog
        defaultEmail={auth.user?.email ?? ''}
        isEmailLocked={Boolean(auth.user?.email)}
        isOpen={loveOffering.isOpen}
        onSubmit={loveOffering.submit}
        source={loveOffering.triggerSource}
      />
    </main>
  </ExplorerFrame>
);
