import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { TextHandler } from './zpl-elements/text.handler';
import { BarcodeHandler } from './zpl-elements/barcode.handler';
import { QrcodeHandler } from './zpl-elements/qrcode.handler';
import { ShapeHandler } from './zpl-elements/shape.handler';
import { ImageHandler } from './zpl-elements/image.handler';
import { VariableHandler } from './zpl-elements/variable.handler';
import { CounterHandler } from './zpl-elements/counter.handler';
import { DatetimeHandler } from './zpl-elements/datetime.handler';

interface LabelConfig {
  width: number;
  height: number;
  dpi: number;
}

@Injectable()
export class ZplService {
  private dotsPerMm: number = 8; // 203 DPI = ~8 dots/mm
  private imageHandler: ImageHandler;
  private counterHandler: CounterHandler;

  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {
    this.imageHandler = new ImageHandler(minio);
    this.counterHandler = new CounterHandler(prisma);
  }

  async generateZpl(
    elements: any[],
    config: LabelConfig,
    variables?: Record<string, string>,
    copies: number = 1,
  ): Promise<string> {
    // Editor works in landscape: width=174mm (horizontal), height=76mm (vertical)
    // Printer: roll is 76mm wide, label is 174mm long in feed direction
    // ^PW = roll width = editor height (76mm)
    // ^LL = label length = editor width (174mm)
    //
    // We need to rotate the editor content 90° CCW to map onto the print:
    //   printX = editor.height - editor.y - element.height  (flip Y into X)
    //   printY = editor.x                                   (X becomes Y along feed)
    //   element dimensions stay the same (no swap)
    //   text/barcode rotation: add 270° (= 90° CCW) so content reads correctly
    //   image: rotate 90° CCW via sharp before converting to GRF

    const printWidthMm = config.height;   // 76mm
    const printLengthMm = config.width;   // 174mm
    const printWidthDots = Math.round(printWidthMm * this.dotsPerMm);
    const printLengthDots = Math.round(printLengthMm * this.dotsPerMm);

    let zpl = '';
    zpl += `^XA\n`;
    zpl += `^PON\n`;
    zpl += `^PW${printWidthDots}\n`;
    zpl += `^LL${printLengthDots}\n`;
    zpl += `^LH0,0\n`;

    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const element of sorted) {
      const rotated = this.transformForPrint(element, config.width, config.height);

      const handler = this.getHandler(rotated.type);
      if (handler) {
        const elementZpl = await handler.toZpl(rotated, this.dotsPerMm, variables);
        if (elementZpl) {
          zpl += elementZpl + '\n';
        }
      }
    }

    if (copies > 1) {
      zpl += `^PQ${copies}\n`;
    }

    zpl += `^XZ\n`;
    return zpl;
  }

  /**
   * Transform editor landscape coords to printer portrait coords.
   *
   * Editor (landscape):          Printer (portrait):
   *   X → (0..174mm)              X → (0..76mm, across printhead)
   *   Y ↓ (0..76mm)               Y ↓ (0..174mm, feed direction)
   *
   * 90° CCW rotation:
   *   printX = editorHeight - editorY - elementHeight
   *   printY = editorX
   *   width/height: NOT swapped (element keeps its own w/h)
   *   rotation: +270° (90° CCW) so text/barcode content reads correctly
   */
  private transformForPrint(el: any, editorWidth: number, editorHeight: number): any {
    const printX = editorHeight - el.y - el.height;
    const printY = el.x;
    const printRotation = ((el.rotation || 0) + 270) % 360;

    return {
      ...el,
      x: printX,
      y: printY,
      // width and height stay the same - no swap
      rotation: printRotation,
      _rotatedForPrint: true, // flag for image handler
    };
  }

  private getHandler(type: string): { toZpl: (el: any, dpm: number, vars?: Record<string, string>) => Promise<string> | string } | null {
    switch (type) {
      case 'text':
        return new TextHandler();
      case 'barcode':
        return new BarcodeHandler();
      case 'qrcode':
        return new QrcodeHandler();
      case 'shape':
        return new ShapeHandler();
      case 'image':
        return this.imageHandler;
      case 'variable':
        return new VariableHandler();
      case 'counter':
        return this.counterHandler;
      case 'datetime':
        return new DatetimeHandler();
      default:
        return null;
    }
  }
}
