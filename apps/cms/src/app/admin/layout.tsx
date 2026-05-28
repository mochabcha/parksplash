export const dynamic = 'force-dynamic';
export const revalidate = 0;

import config from '../../payload.config';
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import type { ImportMap, SanitizedConfig, ServerFunctionClient } from 'payload';
import type { ReactNode } from 'react';

const importMap = {} as ImportMap;

export default function Layout({ children }: { children: ReactNode }) {
  return RootLayout({
    children,
    config: Promise.resolve(config as unknown as SanitizedConfig),
    importMap,
    serverFunction: handleServerFunctions as unknown as ServerFunctionClient
  });
}
