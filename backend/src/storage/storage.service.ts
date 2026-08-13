import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

export interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicUrlPrefix: string;
  private readonly isS3Configured: boolean;
  private readonly localUploadDir: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT', '').trim();
    const region = this.configService.get<string>('S3_REGION', 'auto');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', '').trim();
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY', '').trim();
    const forcePathStyle = this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'heyama-objects');
    this.publicUrlPrefix = this.configService.get<string>('S3_PUBLIC_URL_PREFIX', '').trim();

    // Check if S3 credentials are provided
    this.isS3Configured = Boolean(accessKeyId && secretAccessKey);

    this.localUploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }

    if (this.isS3Configured) {
      this.s3Client = new S3Client({
        endpoint: endpoint || undefined,
        region: region,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        forcePathStyle: forcePathStyle,
      });
      this.logger.log(`✅ S3 Storage client initialized (Bucket: "${this.bucketName}", Endpoint: "${endpoint || 'custom'}")`);
    } else {
      this.logger.warn(`ℹ️ Identifiants S3 non configurés dans .env. Mode de stockage local actif dans : ${this.localUploadDir}`);
    }
  }

  /**
   * Upload a file buffer to S3 (or fallback to local static directory if S3 is not yet configured)
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    const extension = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${randomUUID()}${extension}`;

    // 1. Upload to S3 if configured
    if (this.isS3Configured && this.s3Client) {
      const key = `objects/${filename}`;
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);

        // Compute public URL
        let url = '';
        if (this.publicUrlPrefix) {
          url = `${this.publicUrlPrefix.replace(/\/$/, '')}/${key}`;
        } else {
          const endpoint = this.configService.get<string>('S3_ENDPOINT', '');
          if (endpoint) {
            url = `${endpoint.replace(/\/$/, '')}/${this.bucketName}/${key}`;
          } else {
            url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
          }
        }

        this.logger.log(`Uploaded file successfully to S3: key=${key}, url=${url}`);
        return { url, key };
      } catch (error) {
        this.logger.error(`Failed to upload file to S3: ${error.message}`, error.stack);
        throw error;
      }
    }

    // 2. Fallback to local storage for instant zero-config testing
    const localFilePath = path.join(this.localUploadDir, filename);
    await fs.promises.writeFile(localFilePath, file.buffer);

    const baseUrl =
      process.env.RENDER_EXTERNAL_URL ||
      this.configService.get<string>('APP_URL', '') ||
      `http://localhost:${this.configService.get<string>('PORT', '3001')}`;

    const url = `${baseUrl.replace(/\/$/, '')}/uploads/${filename}`;
    const key = `local:${filename}`;

    this.logger.log(`Saved file locally: key=${key}, url=${url}`);
    return { url, key };
  }

  /**
   * Delete a file from S3 (or local directory)
   */
  async deleteFile(key: string): Promise<void> {
    if (!key) return;

    // Local file deletion
    if (key.startsWith('local:')) {
      const filename = key.replace('local:', '');
      const localFilePath = path.join(this.localUploadDir, filename);
      try {
        if (fs.existsSync(localFilePath)) {
          await fs.promises.unlink(localFilePath);
          this.logger.log(`Deleted local file: ${filename}`);
        }
      } catch (err) {
        this.logger.warn(`Could not delete local file ${filename}: ${err.message}`);
      }
      return;
    }

    // S3 deletion
    if (this.isS3Configured && this.s3Client) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });

        await this.s3Client.send(command);
        this.logger.log(`Deleted file successfully from S3: key=${key}`);
      } catch (error) {
        this.logger.warn(`Failed to delete file from S3: ${error.message}`);
      }
    }
  }
}
