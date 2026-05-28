import type { PayloadRequest } from 'payload';

export const requireUser = (request: PayloadRequest) => {
  const user = request.user;

  if (!user) {
    throw new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  return user;
};
