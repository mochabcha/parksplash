import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const sourcePath = new URL('../src/content/pools/pools.source.json', import.meta.url);
const outputPath = new URL('../src/content/pools/pools.generated.json', import.meta.url);
const jacksonvilleCenter = { latitude: 30.3322, longitude: -81.6557 };

const readJson = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
};

const fetchGeocode = async (query, name, retries = 3) => {
  const response = await fetch(
    `https://photon.komoot.io/api/?limit=5&q=${query}`,
    {
      headers: {
        'User-Agent': 'splash-spot-geocoder/0.1 (local build)',
        Accept: 'application/json',
      },
    },
  );

  if (response.status === 429 && retries > 0) {
    await delay(2000);
    return fetchGeocode(query, name, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`Geocoding failed for ${name}: ${response.status}`);
  }

  return response.json();
};

const scoreCandidate = (feature, name) => {
  const latitude = Number(feature.geometry.coordinates[1]);
  const longitude = Number(feature.geometry.coordinates[0]);
  const distancePenalty =
    Math.abs(latitude - jacksonvilleCenter.latitude) + Math.abs(longitude - jacksonvilleCenter.longitude);
  const state = String(feature.properties.state ?? '').toLowerCase();
  const city = String(feature.properties.city ?? '').toLowerCase();
  const featureName = String(feature.properties.name ?? '').toLowerCase();
  const normalizedName = name.toLowerCase();
  let score = 100 - distancePenalty * 100;

  if (state.includes('florida')) {
    score += 40;
  }

  if (['jacksonville', 'baldwin', 'neptune beach'].some((value) => city.includes(value))) {
    score += 30;
  }

  if (normalizedName.split(/[^a-z0-9]+/).some((part) => part.length > 4 && featureName.includes(part))) {
    score += 20;
  }

  return score;
};

const queryAddress = async (name, address) => {
  const normalizedAddress = address.replaceAll('.', '');
  const attempts = [
    address,
    normalizedAddress,
    `${name}, ${address}`,
    `${name}, ${normalizedAddress}`,
    `${address}, United States`,
    name,
  ];

  for (const attempt of attempts) {
    const query = encodeURIComponent(attempt);
    const payload = await fetchGeocode(query, name);
    const candidates = Array.isArray(payload?.features) ? payload.features : [];
    const match = candidates.sort((left, right) => scoreCandidate(right, name) - scoreCandidate(left, name))[0];

    if (match) {
      return {
        latitude: Number(match.geometry.coordinates[1]),
        longitude: Number(match.geometry.coordinates[0]),
        geocodeLabel: [
          match.properties.name,
          match.properties.street,
          match.properties.city,
          match.properties.state,
        ]
          .filter(Boolean)
          .join(', '),
      };
    }
  }

  throw new Error(`No geocoding result found for ${name}`);
};

const source = await readJson(sourcePath, []);
const output = [];

for (const pool of source) {
  const coordinates = await queryAddress(pool.name, pool.address);
  output.push({ ...pool, ...coordinates });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  await delay(250);
}
