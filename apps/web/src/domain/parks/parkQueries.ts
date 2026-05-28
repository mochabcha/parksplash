import { useQuery } from '@tanstack/react-query';
import { loadParkCatalog, loadParkDetail } from './parkApi';

export const parkQueryKeys = {
  all: ['parks'] as const,
  catalog: () => [...parkQueryKeys.all, 'catalog'] as const,
  detail: (slug: string) => [...parkQueryKeys.all, 'detail', slug] as const
};

export const useParkCatalogQuery = () =>
  useQuery({
    queryKey: parkQueryKeys.catalog(),
    queryFn: loadParkCatalog,
    staleTime: 60_000
  });

export const useParkDetailQuery = (slug?: string) =>
  useQuery({
    queryKey: slug ? parkQueryKeys.detail(slug) : [...parkQueryKeys.all, 'detail', 'idle'],
    queryFn: () => loadParkDetail(slug as string),
    enabled: Boolean(slug),
    staleTime: 30_000
  });
