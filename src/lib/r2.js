import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Server-only Cloudflare R2 storage abstraction.
// NEVER import this file from a client component — it reads server env vars
// and uses the AWS SDK.

let client = null;

function getClient() {
  const required = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `R2 storage not configured: missing ${missing.join(', ')}. ` +
        'Add these to your server environment (see .env.example).'
    );
  }
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

export async function uploadObject({ key, body, contentType }) {
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return { key, url: getObjectUrl(key) };
}

export async function deleteObject(key) {
  const s3 = getClient();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export function getObjectUrl(key) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export function getLogoObjectKey(companyId) {
  return `logos/${companyId}.webp`;
}

export function getCompanyLogoUrl(companyId) {
  return getObjectUrl(getLogoObjectKey(companyId));
}
