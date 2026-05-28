export const dynamic = 'force-dynamic';
export const revalidate = 0;

import config from '../../../payload.config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';
import type { ImportMap, SanitizedConfig } from 'payload';

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const importMap = {} as ImportMap;
const configPromise = Promise.resolve(config as unknown as SanitizedConfig);

export const generateMetadata = async ({ params, searchParams }: Args) =>
  generatePageMetadata({
    config: configPromise,
    params: Promise.resolve(await params),
    searchParams: Promise.resolve((await searchParams) as Record<string, string | string[]>)
  });

export default async function Page({ params, searchParams }: Args) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return RootPage({
    config: configPromise,
    importMap,
    params: Promise.resolve({ segments: resolvedParams.segments ?? [] }),
    searchParams: Promise.resolve(resolvedSearchParams as Record<string, string | string[]>)
  });
}
