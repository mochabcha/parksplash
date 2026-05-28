type Bucket = {
  count: number;
  expiresAt: number;
};

const buckets = new Map<string, Bucket>();

export const checkRateLimit = (key: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.expiresAt < now) {
    buckets.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });

    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
};
