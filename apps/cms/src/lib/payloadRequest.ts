import { createPayloadRequest } from '@payloadcms/next/utilities';
import type { PayloadRequest, SanitizedConfig } from 'payload';
import config from '../payload.config';

export const createCmsPayloadRequest = (request: Request) =>
  createPayloadRequest({
    config: Promise.resolve(config as unknown as SanitizedConfig),
    request
  }) as Promise<PayloadRequest>;
