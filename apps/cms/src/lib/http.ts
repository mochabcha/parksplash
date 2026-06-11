import { cmsEnv } from './env';
import { isAllowedOrigin, normalizeOrigin } from './deployment';

const ALLOWED_METHODS = 'GET,POST,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'content-type, authorization, x-requested-with';

const getAllowedOrigin = (request: Request) => {
  const origin = request.headers.get('origin');

  if (!origin) {
    return cmsEnv.publicWebUrl;
  }

  try {
    const normalizedOrigin = normalizeOrigin(origin);

    return isAllowedOrigin(cmsEnv.allowedOrigins, normalizedOrigin) ? normalizedOrigin : cmsEnv.publicWebUrl;
  } catch {
    return cmsEnv.publicWebUrl;
  }
};

export const buildCorsHeaders = (request: Request) =>
  new Headers({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Origin': getAllowedOrigin(request),
    Vary: 'Origin'
  });

export const withCors = (request: Request, response: Response) => {
  const headers = buildCorsHeaders(request);

  response.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText
  });
};

export const jsonWithCors = (request: Request, body: unknown, init?: ResponseInit) =>
  withCors(request, Response.json(body, init));

export const handleOptions = (request: Request) =>
  new Response(null, {
    headers: buildCorsHeaders(request),
    status: 204
  });
