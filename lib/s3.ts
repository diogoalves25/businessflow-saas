// S3-compatible storage module
// This can work with AWS S3, Cloudflare R2, MinIO, or any S3-compatible storage

interface S3Config {
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

interface UploadResult {
  url: string;
  key: string;
  size: number;
}

interface SignedUrlOptions {
  expiresIn?: number; // seconds
  contentType?: string;
}

class S3Client {
  private config: S3Config;

  constructor(config?: Partial<S3Config>) {
    this.config = {
      endpoint: config?.endpoint || process.env.S3_ENDPOINT,
      accessKeyId: config?.accessKeyId || process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: config?.secretAccessKey || process.env.S3_SECRET_ACCESS_KEY || '',
      region: config?.region || process.env.S3_REGION || 'us-east-1',
      bucket: config?.bucket || process.env.S3_BUCKET || 'businessflow-uploads',
    };
  }

  /**
   * Upload a file to S3
   */
  async upload(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string
  ): Promise<UploadResult> {
    // In production, this would use @aws-sdk/client-s3
    // For now, we'll mock the functionality
    
    const size = typeof body === 'string' 
      ? Buffer.byteLength(body) 
      : body.length;

    // Mock URL - in production this would be the actual S3 URL
    const url = this.config.endpoint 
      ? `${this.config.endpoint}/${this.config.bucket}/${key}`
      : `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;

    // In production, you would:
    // 1. Create S3 client
    // 2. Use PutObjectCommand
    // 3. Handle errors and retries

    return {
      url,
      key,
      size,
    };
  }

  /**
   * Get a pre-signed URL for uploading
   */
  async getSignedUploadUrl(
    key: string,
    options?: SignedUrlOptions
  ): Promise<string> {
    const expiresIn = options?.expiresIn || 3600; // 1 hour default
    
    // In production, this would use getSignedUrl from @aws-sdk/s3-request-presigner
    const timestamp = Date.now();
    const signature = Buffer.from(`${key}-${timestamp}-${expiresIn}`).toString('base64');
    
    return `${this.config.endpoint || `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com`}/${key}?signature=${signature}&expires=${timestamp + expiresIn * 1000}`;
  }

  /**
   * Get a pre-signed URL for downloading
   */
  async getSignedDownloadUrl(
    key: string,
    options?: SignedUrlOptions
  ): Promise<string> {
    return this.getSignedUploadUrl(key, options);
  }

  /**
   * Delete a file from S3
   */
  async delete(key: string): Promise<boolean> {
    try {
      // In production, use DeleteObjectCommand
      console.log(`Deleting ${key} from S3`);
      return true;
    } catch (error) {
      console.error('Failed to delete from S3:', error);
      return false;
    }
  }

  /**
   * Check if a file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      // In production, use HeadObjectCommand
      return true; // Mock implementation
    } catch (error) {
      return false;
    }
  }

  /**
   * List files with a prefix
   */
  async list(prefix: string, maxKeys: number = 1000): Promise<string[]> {
    try {
      // In production, use ListObjectsV2Command
      return []; // Mock implementation
    } catch (error) {
      console.error('Failed to list S3 objects:', error);
      return [];
    }
  }
}

// Export singleton instance
export const s3Client = new S3Client();

// Export class for custom instances
export { S3Client };

// Helper functions
export async function uploadFile(
  key: string,
  file: Buffer | Uint8Array | string,
  contentType?: string
): Promise<UploadResult> {
  return s3Client.upload(key, file, contentType);
}

export async function getSignedUrl(
  key: string,
  operation: 'upload' | 'download' = 'download',
  options?: SignedUrlOptions
): Promise<string> {
  return operation === 'upload'
    ? s3Client.getSignedUploadUrl(key, options)
    : s3Client.getSignedDownloadUrl(key, options);
}

export async function deleteFile(key: string): Promise<boolean> {
  return s3Client.delete(key);
}