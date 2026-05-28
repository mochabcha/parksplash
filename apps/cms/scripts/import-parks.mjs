import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../../..');
const parksPath = path.join(repoRoot, 'data/bootstrap/content/parks/parks.generated.json');
const amenitiesPath = path.join(repoRoot, 'data/bootstrap/content/parks/amenities.generated.json');
const publicRoot = path.join(repoRoot, 'data/bootstrap/public');
const optimizedRoot = await mkdtemp(path.join(os.tmpdir(), 'parksplash-media-'));

const parks = JSON.parse(await readFile(parksPath, 'utf8'));
const amenities = JSON.parse(await readFile(amenitiesPath, 'utf8'));

const payload = await getPayload({ config });

const amenityByKey = new Map();
let uploadedMediaCount = 0;
const forceMediaUpload = process.env.FORCE_MEDIA_UPLOAD === '1';
const maxImageWidth = Number(process.env.PARK_IMAGE_MAX_WIDTH ?? 1600);
const jpegQuality = Number(process.env.PARK_IMAGE_JPEG_QUALITY ?? 82);
const pngQuality = Number(process.env.PARK_IMAGE_PNG_QUALITY ?? 82);
const webpQuality = Number(process.env.PARK_IMAGE_WEBP_QUALITY ?? 82);

const fileExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const getOptimizedOutputPath = (absolutePath) => {
  const parsed = path.parse(absolutePath);
  return path.join(optimizedRoot, `${parsed.name}${parsed.ext.toLowerCase()}`);
};

const optimizeImage = async (absolutePath) => {
  const outputPath = getOptimizedOutputPath(absolutePath);
  const extension = path.extname(absolutePath).toLowerCase();
  const pipeline = sharp(absolutePath)
    .rotate()
    .resize({
      width: maxImageWidth,
      height: maxImageWidth,
      fit: 'inside',
      withoutEnlargement: true
    });

  if (extension === '.png') {
    await pipeline.png({ compressionLevel: 9, quality: pngQuality }).toFile(outputPath);
    return outputPath;
  }

  if (extension === '.webp') {
    await pipeline.webp({ quality: webpQuality }).toFile(outputPath);
    return outputPath;
  }

  await pipeline.jpeg({ quality: jpegQuality, mozjpeg: true }).toFile(outputPath);
  return outputPath;
};

const ensureMediaForPark = async (park) => {
  if (!park.localImagePath) {
    return null;
  }

  const absolutePath = path.join(publicRoot, park.localImagePath.replace(/^\//, ''));

  if (!(await fileExists(absolutePath))) {
    return null;
  }

  const optimizedPath = await optimizeImage(absolutePath);
  const filename = path.basename(absolutePath);
  const existing = await payload.find({
    collection: 'media',
    where: {
      filename: {
        equals: filename
      }
    },
    limit: 1
  });

  if (existing.docs[0]) {
    if (!forceMediaUpload) {
      return existing.docs[0].id;
    }

    const updated = await payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data: {
        alt: `${park.name} hero image`,
        prefix: process.env.S3_PREFIX ?? undefined
      },
      filePath: optimizedPath
    });

    uploadedMediaCount += 1;
    return updated.id;
  }

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: `${park.name} hero image`,
      prefix: process.env.S3_PREFIX ?? undefined
    },
    filePath: optimizedPath
  });

  uploadedMediaCount += 1;
  return created.id;
};

try {
  for (const amenity of amenities) {
    const existing = await payload.find({
      collection: 'amenities',
      where: {
        key: {
          equals: amenity.key
        }
      },
      limit: 1
    });

    const doc =
      existing.docs[0] ??
      (await payload.create({
        collection: 'amenities',
        data: amenity
      }));

    amenityByKey.set(amenity.key, doc.id);
  }

  for (const park of parks) {
    const image = await ensureMediaForPark(park);
    const existing = await payload.find({
      collection: 'parks',
      where: {
        slug: {
          equals: park.id
        }
      },
      limit: 1
    });

    const data = {
      name: park.name,
      slug: park.id,
      address: park.address,
      hours: park.hours,
      mapQuery: park.mapQuery ?? park.address,
      detailUrl: park.detailUrl,
      description: park.description,
      location: {
        latitude: park.latitude,
        longitude: park.longitude
      },
      geocodeSource: 'import',
      coolDownCategory: park.hasPool && park.amenityKeys.includes('splashpad')
        ? 'both'
        : park.hasPool
          ? 'pool'
          : park.amenityKeys.includes('splashpad')
            ? 'splash-pad'
            : 'none',
      hasPool: Boolean(park.amenityKeys.includes('swimmingpool') || park.poolOverlay),
      hasSplashPad: Boolean(park.amenityKeys.includes('splashpad')),
      image,
      amenityRefs: park.amenityKeys.map((key) => amenityByKey.get(key)).filter(Boolean),
      amenityKeys: park.amenityKeys.map((key) => ({ key })),
      poolOverlay: park.poolOverlay,
      facilityDetails: {
        poolDepthRanges: '',
        kidFriendlyNotes: '',
        accessibilityFeatures: [],
        accessibleRamp: false,
        hasLifeguards: false
      }
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: 'parks',
        id: existing.docs[0].id,
        data
      });
    } else {
      await payload.create({
        collection: 'parks',
        data
      });
    }
  }

  console.log(`Imported ${parks.length} parks into Payload and uploaded ${uploadedMediaCount} media assets${forceMediaUpload ? ' (forced)' : ''}.`);
} finally {
  await rm(optimizedRoot, { recursive: true, force: true });
}
