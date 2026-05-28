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
        openAccount: () => setIsAccountOpen(true),
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
      onCheckIn={() => {
        if (!selectedPark) {
          return;
        }

        if (!auth.user) {
          setIsAccountOpen(true);
          return;
        }

        void submitCheckIn(selectedPark.id, {
          parkId: selectedPark.id
        }).then(() => refreshSelectedPark(selectedPark));
      }}
      onComment={(body) => {
        if (!selectedPark || !body) {
          return;
        }

        if (!auth.user) {
          setIsAccountOpen(true);
          return;
        }

        void submitComment(selectedPark.id, {
          parkId: selectedPark.id,
          body
        }).then(() => refreshSelectedPark(selectedPark));
      }}
      onOpenMaps={openMaps}
      parks={parksWithLocation}
      reporting={{
        isOpen: isReportOpen,
        open: () => setIsReportOpen(true),
        close: () => setIsReportOpen(false),
        submit: async (input) => {
          if (!selectedPark) {
            return;
          }

          if (!auth.user) {
            setIsAccountOpen(true);
            return;
          }

          await submitReport(selectedPark.id, input);
          await refreshSelectedPark(selectedPark);
          setIsReportOpen(false);
        }
      }}
      selectedPark={selectedPark}
      userLocation={location.coords}
    />
  );
};
