import path from 'node:path';
import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { s3Storage } from '@payloadcms/storage-s3';
import { fileURLToPath } from 'node:url';
import { cmsEnv } from './lib/env';
import {
  Amenities,
  LoveOfferings,
  Media,
  ParkCheckIns,
  ParkComments,
  ParkReports,
  Parks,
  Users
} from './collections';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const plugins =
  cmsEnv.aws.bucket && cmsEnv.aws.accessKeyId && cmsEnv.aws.secretAccessKey
    ? [
        s3Storage({
          collections: {
            media: { prefix: process.env.S3_PREFIX ?? undefined }
          },
          bucket: cmsEnv.aws.bucket,
          config: {
            credentials: {
              accessKeyId: cmsEnv.aws.accessKeyId,
              secretAccessKey: cmsEnv.aws.secretAccessKey
            },
            region: cmsEnv.aws.region
          }
        })
      ]
    : [];

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, Amenities, Media, Parks, ParkReports, ParkComments, ParkCheckIns, LoveOfferings],
  cors: [cmsEnv.publicServerUrl, cmsEnv.publicWebUrl],
  secret: cmsEnv.payloadSecret(),
  db: mongooseAdapter({
    url: cmsEnv.mongoUri()
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  plugins
});
