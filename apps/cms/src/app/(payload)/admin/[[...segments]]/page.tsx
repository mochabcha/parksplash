import config from '../../../../payload.config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';

type Args = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = ({ params }: Args) =>
  generatePageMetadata({
    config,
    params
  });

export default function Page({ params, searchParams }: Args) {
  return RootPage({
    config,
    params,
    searchParams
  });
}
