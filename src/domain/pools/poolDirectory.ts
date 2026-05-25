import poolDirectory from '../../content/pools/pools.generated.json';
import { buildPoolViewModel } from './poolSeason';
import type { PoolRecord, PoolViewModel } from './pool.types';

const typedPoolDirectory = poolDirectory as PoolRecord[];

export const getPoolDirectory = (date = new Date()): PoolViewModel[] =>
  typedPoolDirectory.map((pool) => ({
    ...pool,
    ...buildPoolViewModel(pool, date),
  }));
