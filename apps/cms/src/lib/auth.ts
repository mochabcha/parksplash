import type { PayloadRequest } from 'payload';
import { jsonWithCors } from './http';

export const requireUser = (payloadRequest: PayloadRequest, request?: Request) => {
  const user = payloadRequest.user;

  if (!user) {
    const response = request
      ? jsonWithCors(request, { error: 'Authentication required.' }, { status: 401 })
      : Response.json({ error: 'Authentication required.' }, { status: 401 });

    throw response;
  }

  return user;
};
