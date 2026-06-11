import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ParksExplorerTemplate } from '../components/templates/ParksExplorerTemplate/ParksExplorerTemplate';
import {
  createLoveOfferingSession,
  submitCheckIn,
  submitComment,
  submitReport,
  submitZeroLoveOffering
} from '../domain/parks/parkApi';
import { parkQueryKeys, useParkCatalogQuery, useParkDetailQuery } from '../domain/parks/parkQueries';
import type { ParkViewModel } from '../domain/parks/park.types';
import { useLoveOfferingGate } from '../features/donations/useLoveOfferingGate';
import { useAuth } from '../features/auth/useAuth';
import { useFeatureCoach } from '../features/onboarding/useFeatureCoach';
import { applyUserLocationToParks, useParkExplorer } from '../features/park-explorer/useParkExplorer';
import { useUserLocation } from '../features/location/useUserLocation';
import { useThemeMode } from '../features/theme/useThemeMode';

const asErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Request failed.');

export const App = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const auth = useAuth();
  const queryClient = useQueryClient();
  const location = useUserLocation(auth.user);
  const theme = useThemeMode();
  const gate = useLoveOfferingGate(auth.user);
  const parkCatalogQuery = useParkCatalogQuery();
  const parksWithLocation = useMemo(
    () => applyUserLocationToParks(parkCatalogQuery.data ?? [], location),
    [location, parkCatalogQuery.data],
  );
  const explorer = useParkExplorer(parksWithLocation);
  const parkDetailQuery = useParkDetailQuery(explorer.selectedPark?.slug);
  const selectedPark = (parkDetailQuery.data ?? explorer.selectedPark) as ParkViewModel | undefined;
  const featureCoach = useFeatureCoach({
    hasSelectedPark: Boolean(selectedPark)
  });

  useEffect(() => {
    if (!selectedPark?.id) {
      return;
    }

    gate.trackViewedPark(selectedPark.id);
  }, [gate, selectedPark?.id]);

  const refreshSelectedPark = async (park?: ParkViewModel) => {
    const invalidations = [queryClient.invalidateQueries({ queryKey: parkQueryKeys.catalog() })];

    if (park?.slug) {
      invalidations.push(queryClient.invalidateQueries({ queryKey: parkQueryKeys.detail(park.slug) }));
    }

    await Promise.all(invalidations);
  };

  const openMaps = (park: ParkViewModel) => {
    featureCoach.recordAction();

    if (gate.interceptGoogleMaps(park.id)) {
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(park.mapQuery || park.address)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <ParksExplorerTemplate
      {...explorer}
      {...theme}
      auth={{
        user: auth.user,
        authError: auth.authError,
        isAccountOpen: isAccountOpen,
        openAccount: () => {
          featureCoach.recordAction();
          setIsAccountOpen(true);
        },
        closeAccount: () => setIsAccountOpen(false),
        signIn: auth.signIn,
        signUp: auth.signUp,
        signOut: auth.signOut
      }}
      dataState={{
        isLoading: parkCatalogQuery.isLoading,
        errorMessage: parkCatalogQuery.error ? asErrorMessage(parkCatalogQuery.error) : undefined,
        onRetry: () => {
          void parkCatalogQuery.refetch();
        }
      }}
      loveOffering={{
        isOpen: gate.isOpen,
        triggerSource: gate.triggerSource,
        submit: async ({ amount, email }) => {
          if (amount <= 0) {
            await submitZeroLoveOffering({
              amount: 0,
              email,
              source: gate.triggerSource,
              parkId: gate.parkId
            });
            gate.persistUnlock();
            return;
          }

          const session = await createLoveOfferingSession({
            amount,
            email,
            source: gate.triggerSource,
            parkId: gate.parkId
          });

          if (session.checkoutUrl) {
            gate.persistUnlock();
            window.location.assign(session.checkoutUrl);
          }
        }
      }}
      clearAmenityFilters={() => {
        featureCoach.recordAction();
        explorer.clearAmenityFilters();
      }}
      onCheckIn={() => {
        if (!selectedPark) {
          return;
        }

        if (!auth.user) {
          featureCoach.recordAction();
          setIsAccountOpen(true);
          return;
        }

        featureCoach.recordAction();
        void submitCheckIn(selectedPark.id, {
          parkId: selectedPark.id
        }).then(() => refreshSelectedPark(selectedPark));
      }}
      onComment={(body) => {
        if (!selectedPark || !body) {
          return;
        }

        if (!auth.user) {
          featureCoach.recordAction();
          setIsAccountOpen(true);
          return;
        }

        featureCoach.recordAction();
        void submitComment(selectedPark.id, {
          parkId: selectedPark.id,
          body
        }).then(() => refreshSelectedPark(selectedPark));
      }}
      onOpenMaps={openMaps}
      featureCoach={{
        activeTip: featureCoach.activeTip,
        dismiss: featureCoach.dismissActiveTip
      }}
      openDialog={(dialog) => {
        featureCoach.recordAction();
        explorer.openDialog(dialog);
      }}
      openDrawer={() => {
        featureCoach.recordAction();
        explorer.openDrawer();
      }}
      openParkFromBrowser={(parkId) => {
        featureCoach.recordAction();
        explorer.openParkFromBrowser(parkId);
      }}
      openParkFromMap={(parkId) => {
        featureCoach.recordAction();
        explorer.openParkFromMap(parkId);
      }}
      openSidePanelTab={(tab) => {
        featureCoach.recordAction();
        explorer.openSidePanelTab(tab);
      }}
      parks={parksWithLocation}
      reporting={{
        isOpen: isReportOpen,
        open: () => {
          featureCoach.recordAction();
          setIsReportOpen(true);
        },
        close: () => setIsReportOpen(false),
        submit: async (input) => {
          if (!selectedPark) {
            return;
          }

          if (!auth.user) {
            featureCoach.recordAction();
            setIsAccountOpen(true);
            return;
          }

          featureCoach.recordAction();
          await submitReport(selectedPark.id, input);
          await refreshSelectedPark(selectedPark);
          setIsReportOpen(false);
        }
      }}
      recenterMap={() => {
        featureCoach.recordAction();
        explorer.recenterMap();
      }}
      selectedPark={selectedPark}
      setActiveQuickFilter={(filter) => {
        featureCoach.recordAction();
        explorer.setActiveQuickFilter(filter);
      }}
      setSidePanelTab={(tab) => {
        featureCoach.recordAction();
        explorer.setSidePanelTab(tab);
      }}
      userLocation={location.coords}
      toggleAmenityFilter={(amenityKey) => {
        featureCoach.recordAction();
        explorer.toggleAmenityFilter(amenityKey);
      }}
      toggleSidePanel={() => {
        featureCoach.recordAction();
        explorer.toggleSidePanel();
      }}
    />
  );
};
