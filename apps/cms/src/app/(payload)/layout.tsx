import config from '../../payload.config';
import { RootLayout } from '@payloadcms/next/layouts';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return RootLayout({
    children,
    config
  });
}
