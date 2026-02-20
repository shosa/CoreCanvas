import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as QRCode from 'qrcode';
import * as bwipjs from 'bwip-js';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.upload(file);
  }

  @Get()
  findAll() {
    return this.imagesService.findAll();
  }

  /** GET /images/qr?data=...&size=200 — QR PNG inline per ZplBox */
  @Get('qr')
  async generateQr(
    @Query('data') data: string,
    @Query('size') size: string,
    @Res() res: Response,
  ) {
    const px = Math.min(Math.max(parseInt(size) || 200, 50), 2000);
    const png = await QRCode.toBuffer(data || '', {
      width: px,
      margin: 0,
      errorCorrectionLevel: 'M',
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(png);
  }

  /** GET /images/barcode?data=...&type=code128&height=100&showText=true — barcode PNG inline */
  @Get('barcode')
  async generateBarcode(
    @Query('data') data: string,
    @Query('type') type: string,
    @Query('height') height: string,
    @Query('showText') showText: string,
    @Res() res: Response,
  ) {
    const bcType = type || 'code128';
    const bcHeight = Math.min(Math.max(parseInt(height) || 100, 10), 500);
    const includeText = showText === 'true';

    const png = await bwipjs.toBuffer({
      bcid: bcType,
      text: data || '0',
      height: bcHeight / 10,
      includetext: includeText,
      textxalign: 'center',
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(png);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
