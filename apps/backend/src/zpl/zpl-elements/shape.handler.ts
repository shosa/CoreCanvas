export class ShapeHandler {
  toZpl(element: any, dotsPerMm: number): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const width = Math.round((element.width || 10) * dotsPerMm);
    const height = Math.round((element.height || 10) * dotsPerMm);
    const borderWidth = Math.round((element.borderWidth || 1) * dotsPerMm);
    const color = element.filled ? 'B' : 'W';

    let zpl = `^FO${x},${y}`;

    switch (element.shapeType || 'rectangle') {
      case 'rectangle':
        // ^GB = Graphic Box: width, height, border thickness, line color, corner rounding
        zpl += `^GB${width},${height},${borderWidth},${color}`;
        if (element.cornerRadius) {
          zpl += `,${Math.round(element.cornerRadius * dotsPerMm)}`;
        }
        zpl += `^FS`;
        break;

      case 'line':
        if (element.orientation === 'vertical') {
          zpl += `^GB${borderWidth},${height},${borderWidth}^FS`;
        } else {
          zpl += `^GB${width},${borderWidth},${borderWidth}^FS`;
        }
        break;

      case 'ellipse':
        // ^GE = Graphic Ellipse: width, height, border thickness, line color
        zpl += `^GE${width},${height},${borderWidth},${color}^FS`;
        break;

      default:
        zpl += `^GB${width},${height},${borderWidth}^FS`;
    }

    return zpl;
  }
}
