import { PoolsExplorerTemplate } from '../components/templates/PoolsExplorerTemplate/PoolsExplorerTemplate';
import { getPoolDirectory } from '../domain/pools/poolDirectory';
import { usePoolExplorer } from '../features/pool-explorer/usePoolExplorer';

export const App = () => {
  const pools = getPoolDirectory();
  const explorer = usePoolExplorer(pools);

  return <PoolsExplorerTemplate {...explorer} />;
};
