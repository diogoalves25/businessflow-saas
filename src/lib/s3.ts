// S3 functionality is temporarily disabled
// To enable S3 uploads:
// 1. Install AWS SDK: npm install @aws-sdk/client-s3
// 2. Set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME
// 3. Uncomment the code below

export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  console.warn('S3 uploads are currently disabled. Files will not be persisted.');
  // Return a mock URL
  return `https://placeholder.s3.amazonaws.com/${key}`;
}

export async function deleteFromS3(url: string): Promise<void> {
  console.warn('S3 deletes are currently disabled.');
}

/*
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'businessflow-receipts';

export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFromS3(url: string): Promise<void> {
  try {
    // Extract key from URL
    const key = url.replace(`https://${BUCKET_NAME}.s3.amazonaws.com/`, '');

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    // Don't throw - just log the error
  }
}
*/