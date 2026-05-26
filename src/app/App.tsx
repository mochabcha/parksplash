import { useState } from 'react';
import { ParksExplorerTemplate } from '../components/templates/ParksExplorerTemplate/ParksExplorerTemplate';
import { getParkDirectory } from '../domain/parks/parkDirectory';
import { useParkExplorer } from '../features/park-explorer/useParkExplorer';
import { useThemeMode } from '../features/theme/useThemeMode';

export const App = () => {
  const [parks] = useState(() => getParkDirectory());
  const explorer = useParkExplorer(parks);
  const theme = useThemeMode();

  return <ParksExplorerTemplate {...explorer} {...theme} />;
};
