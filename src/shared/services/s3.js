import { randomUUID } from 'crypto';
import path from 'path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { UPLOAD_ROOT } from '../utils/uploadPaths.js';

let client;

export const isS3Configured = () =>
  Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_BUCKET_NAME
  );

const getClient = () => {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
};

export const buildObjectKey = (subdir, originalname) => {
  const ext = path.extname(originalname) || '.jpg';
  const safe = path.basename(originalname, ext).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  return `${UPLOAD_ROOT}/${subdir}/${Date.now()}-${randomUUID()}-${safe}${ext}`;
};

export const uploadBuffer = async (key, buffer, contentType) => {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
};

export const deleteObject = async (key) => {
  if (!key || key.startsWith('http')) return;
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    })
  );
};

export const getPresignedReadUrl = async (key) => {
  const expiresIn = Number(process.env.AWS_PRESIGN_EXPIRES_SECONDS) || 3600;
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn }
  );
};

export const verifyBucketAccess = async () => {
  await getClient().send(new HeadBucketCommand({ Bucket: process.env.AWS_BUCKET_NAME }));
};
