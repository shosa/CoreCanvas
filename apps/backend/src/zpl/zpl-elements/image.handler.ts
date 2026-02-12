import sharp from 'sharp';
import { MinioService } from '../../minio/minio.service';

export class ImageHandler {
  constructor(private minio: MinioService) {}

  async toZpl(element: any, dotsPerMm: number): Promise<string> {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    // For images, the editor width/height are in editor-space (landscape).
    // After the 90° CW rotation the printed dimensions swap:
    //   printedWidth  = editorHeight (in dots)
    //   printedHeight = editorWidth  (in dots)
    const editorW = Math.round((element.width || 20) * dotsPerMm);
    const editorH = Math.round((element.height || 20) * dotsPerMm);

    if (!element.minioPath) return '';

    try {
      const buffer = await this.minio.getFileBuffer(element.minioPath);

      let pipeline = sharp(buffer)
        .resize(editorW, editorH, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } });

      // Rotate 90° CW so the image reads correctly when the printed
      // label is rotated 90° CCW by the user.
      if (element._needsImageRotation) {
        pipeline = pipeline.rotate(90, { background: { r: 255, g: 255, b: 255 } });
      }

      const { data, info } = await pipeline
        .greyscale()
        .threshold(128)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const actualWidth = info.width;
      const actualHeight = info.height;

      const grf = this.bufferToGrf(data, actualWidth, actualHeight, info.channels);
      const bytesPerRow = Math.ceil(actualWidth / 8);
      const totalBytes = bytesPerRow * actualHeight;

      let zpl = `^FO${x},${y}`;
      zpl += `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${grf}^FS`;

      return zpl;
    } catch (error) {
      console.error('Image ZPL conversion error:', error);
      return '';
    }
  }

  private bufferToGrf(data: Buffer, width: number, height: number, channels: number): string {
    const bytesPerRow = Math.ceil(width / 8);
    let hex = '';

    for (let row = 0; row < height; row++) {
      for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelX = byteIdx * 8 + bit;
          if (pixelX < width) {
            const pixelIndex = (row * width + pixelX) * channels;
            // After threshold: 0 = black, 255 = white
            // ZPL GRF: 1 = black dot, 0 = white (no print)
            if (data[pixelIndex] === 0) {
              byte |= (1 << (7 - bit));
            }
          }
        }
        hex += byte.toString(16).padStart(2, '0').toUpperCase();
      }
    }

    return hex;
  }
}
