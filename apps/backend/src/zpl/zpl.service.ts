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
    // Editor: landscape, width=174mm (horizontal), height=76mm (vertical)
    // Printer: roll width=76mm (printhead direction), label length=174mm (feed)
    //
    // ZPL coordinate system:
    //   X = across printhead (0..76mm)   = editor Y axis
    //   Y = feed direction  (0..174mm)   = editor X axis
    //
    // To map editor → printer:
    //   printerX = editorY    (swap axes)
    //   printerY = editorX    (swap axes)
    //   No dimension swap, no coordinate flip.
    //   Text rotation: add 90° so text reads along feed (Y printer = X editor)
    //   Image: rotate 90° CW with sharp

    const printWidthDots = Math.round(config.height * this.dotsPerMm);  // 76mm
    const printLengthDots = Math.round(config.width * this.dotsPerMm);  // 174mm

    let zpl = '';
    zpl += `^XA\n`;
    zpl += `^PON\n`;
    zpl += `^PW${printWidthDots}\n`;
    zpl += `^LL${printLengthDots}\n`;
    zpl += `^LH0,0\n`;

    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const element of sorted) {
      const mapped = this.mapToPrinter(element, config);

      const handler = this.getHandler(mapped.type);
      if (handler) {
        const elementZpl = await handler.toZpl(mapped, this.dotsPerMm, variables);
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
   * Map editor landscape coordinates to printer coordinates.
   *
   * Editor: landscape 174×76mm.  User reads it left-to-right.
   * Printer: roll 76mm wide, label 174mm long (feed direction).
   * When the user takes the printed label and rotates it 90° CCW,
   * it should look exactly like the editor.
   *
   * Mapping:
   *   printerX = editorY          (swap axes)
   *   printerY = editorX          (swap axes)
   *
   * Text/barcode: add 90° so content reads along feed direction.
   * Shapes (^GB): swap width↔height (no rotation param in ZPL).
   * Images (^GFA): rotate bitmap 90° CW with sharp (no rotation param).
   * QR codes: square, no special handling needed.
   */
  private mapToPrinter(el: any, config: LabelConfig): any {
    const isShape = el.type === 'shape';
    const isImage = el.type === 'image';

    // For lines, swap orientation (horizontal ↔ vertical)
    const orientation = isShape && el.orientation
      ? (el.orientation === 'horizontal' ? 'vertical' : 'horizontal')
      : el.orientation;

    // Flip the editor Y axis: elements at the top of the editor (small Y)
    // must end up at the far side of the printhead (large printerX).
    const printerX = config.height - el.y - el.height;

    return {
      ...el,
      x: printerX,                // editor Y flipped → printer X (across printhead)
      y: el.x,                    // editor X → printer Y (feed direction)
      width: isShape ? el.height : el.width,    // shapes: swap w↔h
      height: isShape ? el.width : el.height,   // shapes: swap w↔h
      rotation: ((el.rotation || 0) + 90) % 360,
      orientation,
      _needsImageRotation: isImage,
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
