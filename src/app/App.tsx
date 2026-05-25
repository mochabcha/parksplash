import { useState } from 'react';
import { PoolsExplorerTemplate } from '../components/templates/PoolsExplorerTemplate/PoolsExplorerTemplate';
import { getPoolDirectory } from '../domain/pools/poolDirectory';
import { usePoolExplorer } from '../features/pool-explorer/usePoolExplorer';
import { useThemeMode } from '../features/theme/useThemeMode';

export const App = () => {
  const [pools] = useState(() => getPoolDirectory());
  const explorer = usePoolExplorer(pools);
  const theme = useThemeMode();

  return <PoolsExplorerTemplate {...explorer} {...theme} />;
};
