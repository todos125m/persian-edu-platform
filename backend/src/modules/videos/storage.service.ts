import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3: AWS.S3 | null = null;
  private bucketName: string;
  private isLocal: boolean;
  private uploadDir: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const accessKey = this.configService.get('S3_ACCESS_KEY');
    const secretKey = this.configService.get('S3_SECRET_KEY');

    // Check if S3 is properly configured
    this.isLocal =
      !accessKey ||
      !secretKey ||
      accessKey === 'your-access-key' ||
      secretKey === 'your-secret-key';

    if (!this.isLocal) {
      this.s3 = new AWS.S3({
        endpoint: this.configService.get('S3_ENDPOINT'),
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: this.configService.get('S3_REGION', 'ir-thr-at1'),
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      });
      this.logger.log('Using S3 storage');
    } else {
      this.logger.log('S3 not configured - using local file storage');
    }

    this.bucketName = this.configService.get('S3_BUCKET_NAME', 'edu-videos');

    // Setup local upload directory
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    const videosDir = path.join(this.uploadDir, 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
  }

  isLocalStorage(): boolean {
    return this.isLocal;
  }

  // Generate unique storage key
  generateStorageKey(filename: string): string {
    const ext = filename.split('.').pop();
    return `videos/${uuid()}.${ext}`;
  }

  // Get pre-signed URL for upload (admin) - S3 only
  async getUploadUrl(storageKey: string, contentType: string): Promise<string> {
    if (this.isLocal || !this.s3) {
      throw new Error('S3 is not configured. Use local upload instead.');
    }

    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: contentType,
      Expires: 3600,
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }

  // Local: Save uploaded file
  async saveFileLocally(
    storageKey: string,
    buffer: Buffer,
  ): Promise<{ size: number }> {
    const filePath = path.join(this.uploadDir, storageKey);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    const stats = fs.statSync(filePath);

    return { size: stats.size };
  }

  // Get stream URL
  async getStreamUrl(storageKey: string, expiresIn = 7200): Promise<string> {
    if (this.isLocal || !this.s3) {
      return `/uploads/${storageKey}`;
    }

    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  // Delete video from storage
  async deleteVideo(storageKey: string): Promise<void> {
    if (this.isLocal || !this.s3) {
      const filePath = path.join(this.uploadDir, storageKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return;
    }

    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
    };

    await this.s3.deleteObject(params).promise();
  }

  // Upload file directly (for HLS segments)
  async uploadFile(
    storageKey: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    if (this.isLocal || !this.s3) {
      await this.saveFileLocally(storageKey, buffer);
      return;
    }

    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: storageKey,
        Body: buffer,
        ContentType: contentType,
      })
      .promise();
  }

  // Delete directory (for HLS cleanup)
  async deleteDirectory(prefix: string): Promise<void> {
    if (this.isLocal || !this.s3) {
      const dirPath = path.join(this.uploadDir, prefix);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
      return;
    }

    // List and delete all objects with this prefix
    const listResult = await this.s3
      .listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix,
      })
      .promise();

    if (listResult.Contents && listResult.Contents.length > 0) {
      await this.s3
        .deleteObjects({
          Bucket: this.bucketName,
          Delete: {
            Objects: listResult.Contents.map((obj) => ({ Key: obj.Key! })),
          },
        })
        .promise();
    }
  }

  // Get video metadata
  async getVideoMetadata(storageKey: string) {
    if (this.isLocal || !this.s3) {
      const filePath = path.join(this.uploadDir, storageKey);
      const stats = fs.statSync(filePath);
      return { ContentLength: stats.size };
    }

    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
    };

    return this.s3.headObject(params).promise();
  }
}
