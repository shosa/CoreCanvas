import { Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async upload(file: Express.Multer.File) {
    const metadata = await sharp(file.buffer).metadata();
    const { filePath } = await this.minio.uploadFile(file, 'images');

    return this.prisma.image.create({
      data: {
        name: file.originalname,
        minioPath: filePath,
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
    });
  }

  async findAll() {
    return this.prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Immagine non trovata');

    const url = await this.minio.getFileUrl(image.minioPath);
    return { ...image, url };
  }

  async remove(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Immagine non trovata');

    await this.minio.deleteFile(image.minioPath);
    return this.prisma.image.delete({ where: { id } });
  }
}
