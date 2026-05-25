import { useEffect, useState } from 'react';
import type { PoolViewModel } from '../../domain/pools/pool.types';

export type PoolFilter = 'all' | 'open-now' | 'lessons' | 'july';
export type AppDialog = 'season-guide' | null;

interface ToastState {
  id: number;
  message: string;
}

const filterPools = (pools: PoolViewModel[], filter: PoolFilter) => {
  switch (filter) {
    case 'open-now':
      return pools.filter((pool) => pool.status.state === 'open-now');
    case 'lessons':
      return pools.filter((pool) => pool.lessons === 'onsite' || pool.lessons === 'citywide');
    case 'july':
      return pools.filter((pool) => pool.openingPlan === 'july');
    default:
      return pools;
  }
};

export const usePoolExplorer = (pools: PoolViewModel[]) => {
  const [activeFilter, setActiveFilter] = useState<PoolFilter>('all');
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<AppDialog>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [recenterSignal, setRecenterSignal] = useState(0);

  const filteredPools = filterPools(pools, activeFilter);
  const selectedPool =
    filteredPools.find((pool) => pool.id === selectedPoolId) ??
    pools.find((pool) => pool.id === selectedPoolId) ??
    undefined;

  const pushToast = (message: string) => {
    setToast({
      id: Date.now(),
      message,
    });
  };

  useEffect(() => {
    if (selectedPool && !filteredPools.some((pool) => pool.id === selectedPool.id)) {
      setSelectedPoolId('');
      setIsDrawerExpanded(false);
    }
  }, [filteredPools, selectedPool]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === toast.id ? null : currentToast));
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleFilterChange = (filter: PoolFilter) => {
    setActiveFilter(filter);
    setRecenterSignal((value) => value + 1);
    pushToast(
      filter === 'all'
        ? 'Showing every pool on the map.'
        : filter === 'open-now'
          ? 'Filtered to pools open right now.'
          : filter === 'lessons'
            ? 'Showing pools with lesson information.'
            : 'Showing the July opening site.',
    );
  };

  const handlePoolSelectFromMap = (poolId: string) => {
    setSelectedPoolId(poolId);
    setIsDrawerExpanded(true);
    setIsSidePanelOpen(false);
  };

  const handlePoolSelectFromBrowser = (poolId: string) => {
    setSelectedPoolId(poolId);
    setIsSidePanelOpen(false);
  };

  const openDrawer = () => setIsDrawerExpanded(true);

  const handleDrawerClose = () => {
    setIsDrawerExpanded(false);
  };

  const handleSidePanelToggle = () => {
    setIsSidePanelOpen((value) => !value);
  };

  const handleRecenter = () => {
    setRecenterSignal((value) => value + 1);
    pushToast('Map recentered to all visible pools.');
  };

  return {
    pools,
    filteredPools,
    selectedPool,
    activeFilter,
    isDrawerExpanded,
    isSidePanelOpen,
    activeDialog,
    toast,
    recenterSignal,
    setActiveFilter: handleFilterChange,
    openPoolFromMap: handlePoolSelectFromMap,
    setSelectedPoolId: handlePoolSelectFromBrowser,
    openDrawer,
    closeDrawer: handleDrawerClose,
    toggleSidePanel: handleSidePanelToggle,
    closeSidePanel: () => setIsSidePanelOpen(false),
    openDialog: (dialog: AppDialog) => setActiveDialog(dialog),
    closeDialog: () => setActiveDialog(null),
    recenterMap: handleRecenter,
    metrics: {
      totalPools: pools.length,
      openNow: pools.filter((pool) => pool.status.state === 'open-now').length,
      splashPads: 16,
    },
  };
};
