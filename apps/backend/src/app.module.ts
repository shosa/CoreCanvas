import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MinioModule } from './minio/minio.module';
import { TemplatesModule } from './templates/templates.module';
import { PrinterModule } from './printer/printer.module';
import { ZplModule } from './zpl/zpl.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MinioModule,
    TemplatesModule,
    PrinterModule,
    ZplModule,
    ImagesModule,
  ],
})
export class AppModule {}
