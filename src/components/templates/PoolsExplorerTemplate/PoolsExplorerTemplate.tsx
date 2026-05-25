import { AppShell } from '../../atoms/AppShell/AppShell';
import { AppDialog } from '../../organisms/AppDialog/AppDialog';
import { AppToast } from '../../organisms/AppToast/AppToast';
import { MapActionDock } from '../../organisms/MapActionDock/MapActionDock';
import { MapTopBar } from '../../organisms/MapTopBar/MapTopBar';
import { PoolDrawer } from '../../organisms/PoolDrawer/PoolDrawer';
import { PoolMap } from '../../organisms/PoolMap/PoolMap';
import { PoolSidePanel } from '../../organisms/PoolSidePanel/PoolSidePanel';
import { seasonGuideSections } from '../../../content/pools/guideContent';
import type { AppDialog as AppDialogType, PoolFilter } from '../../../features/pool-explorer/usePoolExplorer';
import type { ThemeMode } from '../../../features/theme/useThemeMode';
import type { PoolViewModel } from '../../../domain/pools/pool.types';
import styles from './PoolsExplorerTemplate.module.css';

interface PoolsExplorerTemplateProps {
  pools: PoolViewModel[];
  filteredPools: PoolViewModel[];
  selectedPool?: PoolViewModel;
  activeFilter: PoolFilter;
  setActiveFilter: (filter: PoolFilter) => void;
  openPoolFromMap: (poolId: string) => void;
  setSelectedPoolId: (poolId: string) => void;
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
    totalPools: number;
    openNow: number;
    splashPads: number;
  };
}

export const PoolsExplorerTemplate = ({
  filteredPools,
  selectedPool,
  activeFilter,
  setActiveFilter,
  openPoolFromMap,
  setSelectedPoolId,
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
}: PoolsExplorerTemplateProps) => (
  <AppShell>
    <main className={styles.screen}>
      <div className={styles.mapLayer}>
        <PoolMap
          isDrawerExpanded={isDrawerExpanded}
          onSelectPool={openPoolFromMap}
          pools={filteredPools}
          recenterSignal={recenterSignal}
          selectedPoolId={selectedPool?.id}
        />
      </div>
      <MapTopBar
        activeFilter={activeFilter}
        onCenterMap={recenterMap}
        onMenuToggle={toggleSidePanel}
        openNow={metrics.openNow}
        totalPools={metrics.totalPools}
      />
      <PoolSidePanel
        activeFilter={activeFilter}
        isOpen={isSidePanelOpen}
        onClose={closeSidePanel}
        onFilterChange={setActiveFilter}
        onSelectPool={setSelectedPoolId}
        pools={filteredPools}
        selectedPoolId={selectedPool?.id}
      />
      <MapActionDock
        onOpenGuide={() => openDialog('season-guide')}
        onToggleTheme={toggleTheme}
        themeMode={themeMode}
      />
      <PoolDrawer
        isExpanded={isDrawerExpanded}
        onClose={closeDrawer}
        onOpen={openDrawer}
        pool={selectedPool}
      />
      <AppToast toast={toast} />
      <AppDialog
        actions={[{ label: 'Close', onClick: closeDialog }]}
        isOpen={activeDialog === 'season-guide'}
        onClose={closeDialog}
        sections={seasonGuideSections}
        title="2026 season guide"
      />
    </main>
  </AppShell>
);
