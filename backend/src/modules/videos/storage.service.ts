import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // Configure for Arvan Cloud or any S3-compatible storage
    this.s3 = new AWS.S3({
      endpoint: this.configService.get('S3_ENDPOINT'),
      accessKeyId: this.configService.get('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('S3_SECRET_KEY'),
      region: this.configService.get('S3_REGION', 'ir-thr-at1'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    this.bucketName = this.configService.get('S3_BUCKET_NAME')!;
  }

  // Generate unique storage key
  generateStorageKey(filename: string): string {
    const ext = filename.split('.').pop();
    return `videos/${uuid()}.${ext}`;
  }

  // Get pre-signed URL for upload (admin)
  async getUploadUrl(storageKey: string, contentType: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: contentType,
      Expires: 3600, // 1 hour
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }

  // Get pre-signed URL for streaming (time-limited)
  async getStreamUrl(storageKey: string, expiresIn = 7200): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
      Expires: expiresIn, // Default: 2 hours
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  // Delete video from storage
  async deleteVideo(storageKey: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
    };

    await this.s3.deleteObject(params).promise();
  }

  // Get video metadata
  async getVideoMetadata(storageKey: string) {
    const params = {
      Bucket: this.bucketName,
      Key: storageKey,
    };

    return this.s3.headObject(params).promise();
  }
}
