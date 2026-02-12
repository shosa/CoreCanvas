import { Controller, Post, Get, Put, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { ZplService } from '../zpl/zpl.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrintDto, PreviewDto } from './dto/print.dto';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

class UpdatePrinterConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsNumber()
  dpi?: number;
}

@Controller('printer')
export class PrinterController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly zplService: ZplService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('print')
  async print(@Body() dto: PrintDto) {
    try {
      const zpl = await this.zplService.generateZpl(
        dto.elements,
        { width: dto.width, height: dto.height, dpi: 203 },
        dto.variables,
        dto.copies,
      );

      const result = await this.printerService.sendZpl(zpl);

      await this.prisma.printLog.create({
        data: {
          templateId: dto.templateId,
          copies: dto.copies,
          status: result.success ? 'success' : 'error',
          error: result.success ? null : result.message,
          variables: dto.variables ? JSON.stringify(dto.variables) : null,
        },
      });

      return result;
    } catch (error: any) {
      if (dto.templateId) {
        await this.prisma.printLog.create({
          data: {
            templateId: dto.templateId,
            copies: dto.copies,
            status: 'error',
            error: error.message || String(error),
            variables: dto.variables ? JSON.stringify(dto.variables) : null,
          },
        });
      }

      throw new HttpException(
        error.message || 'Errore durante la stampa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('preview')
  async preview(@Body() dto: PreviewDto) {
    const zpl = await this.zplService.generateZpl(
      dto.elements,
      { width: dto.width, height: dto.height, dpi: 203 },
      dto.variables,
    );
    return { zpl };
  }

  @Get('status')
  async status() {
    return this.printerService.checkStatus();
  }

  @Get('config')
  async getConfig() {
    return this.printerService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() dto: UpdatePrinterConfigDto) {
    return this.printerService.updateConfig(dto);
  }
}
