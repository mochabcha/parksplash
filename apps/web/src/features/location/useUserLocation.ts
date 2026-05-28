import { useEffect, useState } from 'react';
import type { AuthUserDto } from '@parksplash/shared';

export interface UserLocationState {
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';
  coords?: {
    latitude: number;
    longitude: number;
  };
}

export const useUserLocation = (user: AuthUserDto | null) => {
  const [state, setState] = useState<UserLocationState>({
    status: 'idle'
  });

  useEffect(() => {
    if (!user) {
      setState({ status: 'idle' });
      return;
    }

    if (user.locationConsent === 'denied') {
      setState({ status: 'denied' });
      return;
    }

    if (!navigator.geolocation) {
      setState({ status: 'unsupported' });
      return;
    }

    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'granted',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      },
      () => setState({ status: 'denied' }),
      {
        enableHighAccuracy: false,
        timeout: 8000
      }
    );
  }, [user]);

  return state;
};
