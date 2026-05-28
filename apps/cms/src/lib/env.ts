const required = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const cmsEnv = {
  mongoUri: () => required('DATABASE_URI'),
  payloadSecret: () => required('PAYLOAD_SECRET'),
  publicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001',
  publicWebUrl: process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000',
  assetBaseUrl: process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceIds: {
    5: process.env.STRIPE_LOVE_OFFERING_5_PRICE_ID ?? 'price_1Tbov2HPs6gwsUdxcsVJZHx4',
    10: process.env.STRIPE_LOVE_OFFERING_10_PRICE_ID ?? 'price_1TbovGHPs6gwsUdxA9EWDQzA',
    25: process.env.STRIPE_LOVE_OFFERING_25_PRICE_ID ?? 'price_1TbovNHPs6gwsUdxNdf6zWrz',
    50: process.env.STRIPE_LOVE_OFFERING_50_PRICE_ID ?? 'price_1TbovWHPs6gwsUdxCZwAzM9r',
    custom: process.env.STRIPE_LOVE_OFFERING_CUSTOM_PRICE_ID ?? 'price_1TbowfHPs6gwsUdxAoVW5e83'
  },
  aws: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION ?? 'us-east-2',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
} as const;
