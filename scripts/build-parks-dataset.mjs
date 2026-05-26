import { load } from 'cheerio';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteOrigin = 'https://www.jacksonville.gov';

const parksHtmlPath = path.join(rootDir, 'public/data/parks.htm');
const detailCacheDir = path.join(rootDir, 'data/parks/details');
const imageDir = path.join(rootDir, 'public/data/parks/images');
const geocodeCachePath = path.join(rootDir, 'data/parks/geocode-cache.json');
const parksOutputPath = path.join(rootDir, 'src/content/parks/parks.generated.json');
const amenitiesOutputPath = path.join(rootDir, 'src/content/parks/amenities.generated.json');
const poolsSourcePath = path.join(rootDir, 'src/content/pools/pools.source.json');
const poolsGeneratedPath = path.join(rootDir, 'src/content/pools/pools.generated.json');

const jacksonvilleCenter = { latitude: 30.3322, longitude: -81.6557 };
const northeastFloridaBounds = {
  minLatitude: 29.85,
  maxLatitude: 30.7,
  minLongitude: -82.15,
  maxLongitude: -81.2,
};
const allowedLocalityFragments = [
  'jacksonville',
  'jacksonville beach',
  'atlantic beach',
  'neptune beach',
  'baldwin',
  'duval',
];
const fallbackAmenityDefinitions = {
  canoe: 'Canoe Access',
  featuredpark: 'Featured Park',
  featuredwaterway: 'Featured Waterway',
  fencing: 'Fencing',
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeName = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeAddress = (value) =>
  value
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const extractZipCode = (value = '') => value.match(/\b(32\d{3})\b/)?.[1] ?? '';
const extractCoreAddress = (value = '') => value.match(/^.*?\b32\d{3}\b/)?.[0]?.trim() ?? value.trim();

const isWithinJacksonvilleRegion = (latitude, longitude) =>
  latitude >= northeastFloridaBounds.minLatitude &&
  latitude <= northeastFloridaBounds.maxLatitude &&
  longitude >= northeastFloridaBounds.minLongitude &&
  longitude <= northeastFloridaBounds.maxLongitude;

const extractBackgroundImage = (styleValue = '') => {
  const match = styleValue.match(/url\((['"]?)(.*?)\1\)/i);
  return match?.[2] ?? '';
};

const toAbsoluteUrl = (input) => {
  if (!input) {
    return '';
  }

  return new URL(input, siteOrigin).href;
};

const ensureDir = (directory) => mkdir(directory, { recursive: true });

const readJson = async (filePath, fallback) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
};

const fileExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
};

const fetchTextWithCache = async (url, cachePath) => {
  if (await fileExists(cachePath)) {
    return readFile(cachePath, 'utf8');
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'splash-spot-parks-ingest/0.1 (local build)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const body = await response.text();
  await writeFile(cachePath, body);
  return body;
};

const downloadFile = async (url, outputPath) => {
  if (!url || (await fileExists(outputPath))) {
    return;
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'splash-spot-parks-ingest/0.1 (local build)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await writeFile(outputPath, Buffer.from(arrayBuffer));
};

const scoreCandidate = (feature, park) => {
  const latitude = Number(feature.geometry.coordinates[1]);
  const longitude = Number(feature.geometry.coordinates[0]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !isWithinJacksonvilleRegion(latitude, longitude)) {
    return Number.NEGATIVE_INFINITY;
  }

  const distancePenalty =
    Math.abs(latitude - jacksonvilleCenter.latitude) + Math.abs(longitude - jacksonvilleCenter.longitude);
  const state = String(feature.properties.state ?? '').toLowerCase();
  const city = String(feature.properties.city ?? '').toLowerCase();
  const district = String(feature.properties.district ?? '').toLowerCase();
  const county = String(feature.properties.county ?? '').toLowerCase();
  const postcode = String(feature.properties.postcode ?? '').toLowerCase();
  const street = String(feature.properties.street ?? '').toLowerCase();
  const featureName = String(feature.properties.name ?? '').toLowerCase();
  const normalizedName = park.name.toLowerCase();
  const normalizedAddress = normalizeAddress(park.address);
  const zipCode = extractZipCode(park.address).toLowerCase();
  const locality = [city, district, county].join(' ');
  let score = 120 - distancePenalty * 100;

  if (state.includes('florida')) {
    score += 80;
  }

  if (allowedLocalityFragments.some((value) => locality.includes(value))) {
    score += 80;
  }

  if (normalizedName.split(/[^a-z0-9]+/).some((part) => part.length > 4 && featureName.includes(part))) {
    score += 20;
  }

  if (zipCode && postcode === zipCode) {
    score += 120;
  }

  if (street && normalizedAddress.includes(street)) {
    score += 35;
  }

  return score;
};

const fetchPhoton = async (query, retries = 3) => {
  const response = await fetch(`https://photon.komoot.io/api/?limit=5&q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'splash-spot-parks-ingest/0.1 (local build)',
      Accept: 'application/json',
    },
  });

  if (response.status === 429 && retries > 0) {
    await delay(2000);
    return fetchPhoton(query, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`Photon request failed for "${query}": ${response.status}`);
  }

  return response.json();
};

const fetchNominatim = async (query, retries = 3) => {
  const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('format', 'jsonv2');
  searchUrl.searchParams.set('limit', '5');
  searchUrl.searchParams.set('countrycodes', 'us');
  searchUrl.searchParams.set('viewbox', `${northeastFloridaBounds.minLongitude},${northeastFloridaBounds.maxLatitude},${northeastFloridaBounds.maxLongitude},${northeastFloridaBounds.minLatitude}`);
  searchUrl.searchParams.set('bounded', '1');

  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'splash-spot-parks-ingest/0.1 (local build)',
      Accept: 'application/json',
    },
  });

  if ((response.status === 429 || response.status === 503) && retries > 0) {
    await delay(2000);
    return fetchNominatim(query, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`Nominatim request failed for "${query}": ${response.status}`);
  }

  return response.json();
};

const selectPhotonMatch = (candidates, park) =>
  candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, park),
    }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((left, right) => right.score - left.score)[0]?.candidate;

const selectNominatimMatch = (candidates, park) => {
  const zipCode = extractZipCode(park.address);

  return candidates
    .map((candidate) => {
      const latitude = Number(candidate.lat);
      const longitude = Number(candidate.lon);
      const displayName = String(candidate.display_name ?? '').toLowerCase();
      let score = isWithinJacksonvilleRegion(latitude, longitude) ? 100 : Number.NEGATIVE_INFINITY;

      if (displayName.includes('florida')) {
        score += 80;
      }

      if (allowedLocalityFragments.some((value) => displayName.includes(value))) {
        score += 80;
      }

      if (zipCode && displayName.includes(zipCode)) {
        score += 120;
      }

      if (normalizeAddress(displayName).includes(normalizeAddress(park.address))) {
        score += 80;
      }

      return {
        candidate,
        score,
      };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((left, right) => right.score - left.score)[0]?.candidate;
};

const geocodePark = async (park, geocodeCache) => {
  const cachedEntry = geocodeCache[park.id];

  if (
    cachedEntry &&
    isWithinJacksonvilleRegion(Number(cachedEntry.latitude), Number(cachedEntry.longitude))
  ) {
    return cachedEntry;
  }

  const coreAddress = extractCoreAddress(park.address);
  const coreMapQuery = extractCoreAddress(park.mapQuery);
  const attempts = [
    `${coreAddress}, Florida`,
    coreMapQuery,
    coreAddress,
    `${park.name}, ${coreAddress}`,
    `${park.name}, Jacksonville, Florida ${extractZipCode(park.address)}`,
  ]
    .filter(Boolean)
    .map((value) => value.replaceAll('.', ''));

  for (const attempt of attempts) {
    const payload = await fetchPhoton(attempt);
    const candidates = Array.isArray(payload?.features) ? payload.features : [];
    const match = selectPhotonMatch(candidates, park);

    if (match) {
      const result = {
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

      geocodeCache[park.id] = result;
      await writeFile(geocodeCachePath, `${JSON.stringify(geocodeCache, null, 2)}\n`);
      await delay(250);
      return result;
    }
  }

  for (const attempt of attempts) {
    const payload = await fetchNominatim(attempt);
    const candidates = Array.isArray(payload) ? payload : [];
    const match = selectNominatimMatch(candidates, park);

    if (match) {
      const result = {
        latitude: Number(match.lat),
        longitude: Number(match.lon),
        geocodeLabel: String(match.display_name ?? ''),
      };

      geocodeCache[park.id] = result;
      await writeFile(geocodeCachePath, `${JSON.stringify(geocodeCache, null, 2)}\n`);
      await delay(250);
      return result;
    }
  }

  throw new Error(`No geocode match for ${park.name}`);
};

const collectDescription = ($) => {
  const historyChunks = $('.park-history')
    .children()
    .map((_, element) => $(element).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
    .filter((value) => !/^about /i.test(value));

  if (historyChunks.length > 0) {
    return historyChunks.join('\n\n');
  }

  const detailChunks = [];
  let collect = false;

  $('.page__content').children().each((_, element) => {
    const node = $(element);

    if (node.hasClass('park-history')) {
      collect = true;
      return;
    }

    if (!collect) {
      return;
    }

    if (node.hasClass('park-map-box')) {
      collect = false;
      return;
    }

    if (/script|style/i.test(element.tagName ?? '')) {
      return;
    }

    const text = node.text().replace(/\s+/g, ' ').trim();

    if (text) {
      detailChunks.push(text);
    }
  });

  return detailChunks.join('\n\n');
};

const parseDetailAmenities = ($) =>
  $('.park-amenities .park-list-amenity')
    .map((_, element) => {
      const node = $(element);
      return {
        key: String(node.attr('data-key') ?? '').trim(),
        label: node.text().replace(/\s+/g, ' ').trim(),
        sourceIconUrl: toAbsoluteUrl(extractBackgroundImage(String(node.attr('style') ?? ''))),
      };
    })
    .get()
    .filter((amenity) => amenity.key && amenity.label);

const parseCardDataset = (element) =>
  Object.entries(element.attribs ?? {})
    .filter(([key, value]) => key.startsWith('data-') && value && !/^\d+$/.test(key.replace('data-', '')))
    .map(([key]) => key.replace('data-', ''));

const parseAmenitiesCatalog = ($) =>
  $('.park-list-dropdown-option.park-list-amenity')
    .map((_, element) => {
      const node = $(element);
      return {
        key: String(node.attr('data-key') ?? ''),
        label: node.text().replace(/\s+/g, ' ').trim(),
        sourceIconUrl: toAbsoluteUrl(extractBackgroundImage(String(node.attr('style') ?? ''))),
      };
    })
    .get()
    .filter((amenity) => amenity.key && amenity.label);

const parseParksFromListing = ($) =>
  $('.park-list-box')
    .map((_, element) => {
      const node = $(element);
      const link = node.find('.park-list-box-title').first();
      const imageUrl = toAbsoluteUrl(
        extractBackgroundImage(String(node.find('.park-list-box-bg').attr('style') ?? '')),
      );
      const detailPath = String(link.attr('href') ?? '');
      const detailUrl = toAbsoluteUrl(detailPath);
      const name = link.text().replace(/\s+/g, ' ').trim();
      const id = slugify(detailPath.split('/').at(-1) || name);
      const amenities = node
        .find('.park-list-box-icon')
        .map((__, iconElement) => String($(iconElement).attr('title') ?? '').trim())
        .get()
        .filter(Boolean);

      return {
        id,
        name,
        address: node.find('.park-list-box-address').text().replace(/\s+/g, ' ').trim(),
        hours: node.find('.park-list-box-hours').text().replace(/\s+/g, ' ').trim(),
        detailPath,
        detailUrl,
        sourceImageUrl: imageUrl,
        amenityKeys: parseCardDataset(element),
        amenities,
      };
    })
    .get()
    .filter((park) => park.id && park.name);

const buildPoolLookup = async () => {
  const [poolSource, poolGenerated] = await Promise.all([
    readJson(poolsSourcePath, []),
    readJson(poolsGeneratedPath, []),
  ]);

  const generatedByAddress = new Map(poolGenerated.map((pool) => [normalizeAddress(pool.address), pool]));

  return poolSource.map((pool) => ({
    ...pool,
    generated: generatedByAddress.get(normalizeAddress(pool.address)),
    normalizedName: normalizeName(pool.name),
    normalizedAddress: normalizeAddress(pool.address),
  }));
};

const mergePoolOverlay = (park, poolLookup) => {
  const normalizedParkName = normalizeName(park.name);
  const normalizedParkAddress = normalizeAddress(park.address);
  const poolMatch =
    poolLookup.find((pool) => pool.normalizedAddress === normalizedParkAddress) ??
    poolLookup.find((pool) => pool.normalizedName === normalizedParkName);

  if (!poolMatch) {
    return {
      ...park,
      poolOverlay: park.amenityKeys.includes('swimmingpool')
        ? {
            source: 'parks-list',
          }
        : null,
      latitude: null,
      longitude: null,
      geocodeLabel: '',
    };
  }

  return {
    ...park,
    poolOverlay: {
      source: 'pool-list',
      openingPlan: poolMatch.openingPlan,
      lessons: poolMatch.lessons,
      splashPad: poolMatch.splashPad,
      siteType: poolMatch.siteType,
    },
    latitude: poolMatch.generated?.latitude ?? null,
    longitude: poolMatch.generated?.longitude ?? null,
    geocodeLabel: poolMatch.generated?.geocodeLabel ?? '',
  };
};

const createStandalonePoolEntries = (poolLookup, parks) => {
  const knownAddresses = new Set(parks.map((park) => normalizeAddress(park.address)));
  const knownNames = new Set(parks.map((park) => normalizeName(park.name)));

  return poolLookup
    .filter(
      (pool) =>
        !knownAddresses.has(pool.normalizedAddress) &&
        !knownNames.has(pool.normalizedName),
    )
    .map((pool) => ({
      id: pool.id,
      name: pool.name,
      address: pool.address,
      hours: '',
      detailPath: '',
      detailUrl: '',
      sourceImageUrl: '',
      localImagePath: '',
      amenityKeys: ['swimmingpool'],
      amenities: ['Swimming Pool'],
      description: '',
      mapQuery: pool.address,
      latitude: pool.generated?.latitude ?? null,
      longitude: pool.generated?.longitude ?? null,
      geocodeLabel: pool.generated?.geocodeLabel ?? '',
      poolOverlay: {
        source: 'pool-list',
        openingPlan: pool.openingPlan,
        lessons: pool.lessons,
        splashPad: pool.splashPad,
        siteType: pool.siteType,
      },
      isStandalonePoolSite: true,
      detailImageUrl: '',
    }));
};

await ensureDir(detailCacheDir);
await ensureDir(imageDir);
await ensureDir(path.dirname(parksOutputPath));

const geocodeCache = await readJson(geocodeCachePath, {});
const listingHtml = await readFile(parksHtmlPath, 'utf8');
const $listing = load(listingHtml);
const amenitiesCatalog = parseAmenitiesCatalog($listing);
const amenitiesCatalogMap = new Map(amenitiesCatalog.map((amenity) => [amenity.key, amenity]));
const parksFromListing = parseParksFromListing($listing);
const poolLookup = await buildPoolLookup();

console.log(`Parsed ${parksFromListing.length} park cards from local listing.`);

const enrichedParks = [];

for (const [index, parkCard] of parksFromListing.entries()) {
  const detailCachePath = path.join(detailCacheDir, `${parkCard.id}.html`);
  const detailHtml = await fetchTextWithCache(parkCard.detailUrl, detailCachePath);
  const $detail = load(detailHtml);
  const detailImageUrl = toAbsoluteUrl(
    extractBackgroundImage(String($detail('.park-box-bg').first().attr('style') ?? '')),
  );
  const mapQuery =
    new URL($detail('.park-box-info a[href*="google.com/maps/search"]').first().attr('href') ?? 'https://www.google.com')
      .searchParams.get('query') ?? parkCard.address;
  const imageUrl = detailImageUrl || parkCard.sourceImageUrl;
  const extension = path.extname(new URL(imageUrl).pathname || '.jpg') || '.jpg';
  const localImageRelativePath = imageUrl ? `/data/parks/images/${parkCard.id}${extension}` : '';
  const localImageDiskPath = imageUrl ? path.join(imageDir, `${parkCard.id}${extension}`) : '';

  if (imageUrl) {
    await downloadFile(imageUrl, localImageDiskPath);
  }

  const mergedPark = mergePoolOverlay(
    {
      ...parkCard,
      detailImageUrl,
      localImagePath: localImageRelativePath,
      mapQuery,
      description: collectDescription($detail),
      sourceImageUrl: imageUrl,
      isStandalonePoolSite: false,
    },
    poolLookup,
  );

  for (const amenity of parseDetailAmenities($detail)) {
    if (!amenitiesCatalogMap.has(amenity.key)) {
      amenitiesCatalogMap.set(amenity.key, amenity);
    }
  }

  if (mergedPark.latitude == null || mergedPark.longitude == null) {
    const geocode = await geocodePark(mergedPark, geocodeCache);
    mergedPark.latitude = geocode.latitude;
    mergedPark.longitude = geocode.longitude;
    mergedPark.geocodeLabel = geocode.geocodeLabel;
  }

  enrichedParks.push(mergedPark);

  if ((index + 1) % 25 === 0) {
    console.log(`Enriched ${index + 1}/${parksFromListing.length} parks...`);
  }
}

const standalonePools = createStandalonePoolEntries(poolLookup, enrichedParks);
const masterDataset = [...enrichedParks, ...standalonePools].sort((left, right) => left.name.localeCompare(right.name));

for (const key of [...new Set(masterDataset.flatMap((park) => park.amenityKeys))]) {
  if (!amenitiesCatalogMap.has(key) && fallbackAmenityDefinitions[key]) {
    amenitiesCatalogMap.set(key, {
      key,
      label: fallbackAmenityDefinitions[key],
      sourceIconUrl: '',
    });
  }
}

const mergedAmenitiesCatalog = [...amenitiesCatalogMap.values()].sort((left, right) => left.label.localeCompare(right.label));

await writeFile(parksOutputPath, `${JSON.stringify(masterDataset, null, 2)}\n`);
await writeFile(amenitiesOutputPath, `${JSON.stringify(mergedAmenitiesCatalog, null, 2)}\n`);

console.log(`Wrote ${masterDataset.length} master park/pool records.`);
console.log(`Wrote ${mergedAmenitiesCatalog.length} amenity definitions.`);
