import { useEffect, useMemo, useState } from 'react';
import { ParksExplorerTemplate } from '../components/templates/ParksExplorerTemplate/ParksExplorerTemplate';
import {
  createLoveOfferingSession,
  loadParkCatalog,
  loadParkDetail,
  submitCheckIn,
  submitComment,
  submitReport,
  submitZeroLoveOffering
} from '../domain/parks/parkApi';
import type { ParkViewModel } from '../domain/parks/park.types';
import { useLoveOfferingGate } from '../features/donations/useLoveOfferingGate';
import { useAuth } from '../features/auth/useAuth';
import { applyUserLocationToParks, useParkExplorer } from '../features/park-explorer/useParkExplorer';
import { useUserLocation } from '../features/location/useUserLocation';
import { useThemeMode } from '../features/theme/useThemeMode';

export const App = () => {
  const [parks, setParks] = useState<ParkViewModel[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const auth = useAuth();
  const location = useUserLocation(auth.user);
  const parksWithLocation = useMemo(() => applyUserLocationToParks(parks, location), [location, parks]);
  const explorer = useParkExplorer(parksWithLocation);
  const theme = useThemeMode();
  const gate = useLoveOfferingGate(auth.user);

  useEffect(() => {
    void loadParkCatalog().then(setParks);
  }, []);

  useEffect(() => {
    if (!explorer.selectedPark?.slug) {
      return;
    }

    gate.trackViewedPark(explorer.selectedPark.id);

    void loadParkDetail(explorer.selectedPark.slug).then((detail) => {
      if (!detail) {
        return;
      }

      setParks((current) => current.map((park) => (park.id === detail.id ? detail : park)));
    });
  }, [explorer.selectedPark?.id, explorer.selectedPark?.slug]);

  const openMaps = (park: ParkViewModel) => {
    if (gate.interceptGoogleMaps(park.id)) {
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(park.mapQuery || park.address)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <ParksExplorerTemplate
      {...explorer}
      {...theme}
      auth={{
        user: auth.user,
        authError: auth.authError,
        isAccountOpen,
        openAccount: () => setIsAccountOpen(true),
        closeAccount: () => setIsAccountOpen(false),
        signIn: auth.signIn,
        signUp: auth.signUp,
        signOut: auth.signOut
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
        if (!explorer.selectedPark) {
          return;
        }

        if (!auth.user) {
          setIsAccountOpen(true);
          return;
        }

        void submitCheckIn(explorer.selectedPark.id, {
          parkId: explorer.selectedPark.id
        });
      }}
      onComment={(body) => {
        if (!explorer.selectedPark || !body) {
          return;
        }

        if (!auth.user) {
          setIsAccountOpen(true);
          return;
        }

        void submitComment(explorer.selectedPark.id, {
          parkId: explorer.selectedPark.id,
          body
        });
      }}
      onOpenMaps={openMaps}
      parks={parksWithLocation}
      reporting={{
        isOpen: isReportOpen,
        open: () => setIsReportOpen(true),
        close: () => setIsReportOpen(false),
        submit: async (input) => {
          if (!explorer.selectedPark) {
            return;
          }

          if (!auth.user) {
            setIsAccountOpen(true);
            return;
          }

          await submitReport(explorer.selectedPark.id, input);
          setIsReportOpen(false);
        }
      }}
      userLocation={location.coords}
    />
  );
};
