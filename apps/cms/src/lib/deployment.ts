const LOCAL_HOSTNAMES = new Set(['127.0.0.1', '0.0.0.0', 'localhost']);
const WILDCARD_HOST_MARKER = '://*.';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const normalizeOrigin = (value: string) => {
  const normalized = stripTrailingSlash(value.trim());
  return new URL(normalized).origin;
};

const normalizeOriginPattern = (value: string) => {
  const normalized = stripTrailingSlash(value.trim());

  if (!normalized.includes(WILDCARD_HOST_MARKER)) {
    return normalizeOrigin(normalized);
  }

  const [protocol, hostSuffix] = normalized.split(WILDCARD_HOST_MARKER);

  if (!protocol || !hostSuffix) {
    throw new Error(`Invalid wildcard origin pattern: ${value}`);
  }

  return `${new URL(`${protocol}://example.com`).protocol}//*.${hostSuffix}`;
};

export const parseOriginList = (...values: Array<string | undefined>) =>
  [...new Set(
    values
      .flatMap((value) => value?.split(',') ?? [])
      .map((value) => value.trim())
      .filter(Boolean)
      .map(normalizeOriginPattern)
  )];

const isLocalOrigin = (origin: string) => LOCAL_HOSTNAMES.has(new URL(origin).hostname);

const isSecureOrigin = (origin: string) => new URL(origin).protocol === 'https:';

const matchesOriginPattern = (pattern: string, origin: string) => {
  if (!pattern.includes(WILDCARD_HOST_MARKER)) {
    return pattern === origin;
  }

  const [protocol, hostSuffix] = pattern.split(WILDCARD_HOST_MARKER);
  const parsedOrigin = new URL(origin);

  return parsedOrigin.protocol === `${protocol}:` && parsedOrigin.hostname.endsWith(`.${hostSuffix}`);
};

export const isAllowedOrigin = (allowedOrigins: readonly string[], origin: string) =>
  allowedOrigins.some((allowedOrigin) => matchesOriginPattern(allowedOrigin, normalizeOrigin(origin)));

export const resolveAuthCookieSettings = (serverOrigin: string, webOrigin: string) => {
  const requiresCrossOriginCookies = serverOrigin !== webOrigin;
  const secure = isSecureOrigin(serverOrigin) && isSecureOrigin(webOrigin);

  if (requiresCrossOriginCookies && secure && !isLocalOrigin(serverOrigin) && !isLocalOrigin(webOrigin)) {
    return {
      sameSite: 'None',
      secure: true
    } as const;
  }

  return {
    sameSite: 'Lax',
    secure
  } as const;
};
