import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'corecanvas-files';

    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey:
        this.configService.get<string>('MINIO_ROOT_USER') ||
        this.configService.get<string>('MINIO_ACCESS_KEY') ||
        'minioadmin',
      secretKey:
        this.configService.get<string>('MINIO_ROOT_PASSWORD') ||
        this.configService.get<string>('MINIO_SECRET_KEY') ||
        'minioadmin',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`MinIO bucket '${this.bucketName}' created`);
      } else {
        console.log(`MinIO bucket '${this.bucketName}' ready`);
      }
    } catch (error) {
      console.error('MinIO initialization error:', (error as any).message);
    }
  }

  async uploadJson(path: string, data: any): Promise<string> {
    const json = JSON.stringify(data);
    const buffer = Buffer.from(json, 'utf-8');
    await this.client.putObject(this.bucketName, path, buffer, buffer.length, {
      'Content-Type': 'application/json',
    });
    return path;
  }

  async getJson(path: string): Promise<any> {
    const stream = await this.client.getObject(this.bucketName, path);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const json = Buffer.concat(chunks).toString('utf-8');
        resolve(JSON.parse(json));
      });
      stream.on('error', reject);
    });
  }

  async uploadFile(
    file: any,
    folder: string = 'images',
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${folder}/${fileName}`;
    await this.client.putObject(this.bucketName, filePath, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    return { filePath, fileName: file.originalname };
  }

  async getFileBuffer(path: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucketName, path);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(path: string): Promise<void> {
    await this.client.removeObject(this.bucketName, path);
  }

  async getFileUrl(path: string, expirySeconds: number = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucketName, path, expirySeconds);
  }
}
