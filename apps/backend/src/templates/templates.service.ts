import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async create(dto: CreateTemplateDto) {
    const minioPath = `templates/${Date.now()}-${dto.name.replace(/\s+/g, '_')}.json`;

    await this.minio.uploadJson(minioPath, {
      elements: dto.elements,
      labelConfig: { width: dto.width, height: dto.height, dpi: 203 },
    });

    return this.prisma.template.create({
      data: {
        name: dto.name,
        description: dto.description,
        width: dto.width,
        height: dto.height,
        minioPath,
      },
    });
  }

  async findAll() {
    return this.prisma.template.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { printLogs: true } },
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        _count: { select: { printLogs: true } },
      },
    });

    if (!template) {
      throw new NotFoundException('Template non trovato');
    }

    const design = await this.minio.getJson(template.minioPath);

    return { ...template, design };
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template non trovato');
    }

    if (dto.elements) {
      await this.minio.uploadJson(template.minioPath, {
        elements: dto.elements,
        labelConfig: {
          width: dto.width ?? template.width,
          height: dto.height ?? template.height,
          dpi: 203,
        },
      });
    }

    return this.prisma.template.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        width: dto.width,
        height: dto.height,
      },
    });
  }

  async remove(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template non trovato');
    }

    await this.minio.deleteFile(template.minioPath);
    if (template.thumbnail) {
      await this.minio.deleteFile(template.thumbnail).catch(() => {});
    }

    return this.prisma.template.delete({ where: { id } });
  }

  async duplicate(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template non trovato');
    }

    const design = await this.minio.getJson(template.minioPath);
    const newMinioPath = `templates/${Date.now()}-${template.name.replace(/\s+/g, '_')}_copy.json`;

    await this.minio.uploadJson(newMinioPath, design);

    return this.prisma.template.create({
      data: {
        name: `${template.name} (copia)`,
        description: template.description,
        width: template.width,
        height: template.height,
        minioPath: newMinioPath,
      },
    });
  }
}
