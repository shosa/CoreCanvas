export class ShapeHandler {
  toZpl(element: any, dotsPerMm: number): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const width = Math.max(1, Math.round((element.width || 10) * dotsPerMm));
    const height = Math.max(1, Math.round((element.height || 10) * dotsPerMm));
    const borderWidth = Math.max(1, Math.round((element.borderWidth || 1) * dotsPerMm));

    // In ZPL: color B=black lines, W=white lines
    // For filled shapes, set border thickness = full size so it fills solid
    const thickness = element.filled ? Math.min(width, height) : borderWidth;

    let zpl = `^FO${x},${y}`;

    switch (element.shapeType || 'rectangle') {
      case 'rectangle':
        // ^GB = Graphic Box: width, height, border thickness, line color, corner rounding
        zpl += `^GB${width},${height},${thickness},B`;
        if (element.cornerRadius) {
          zpl += `,${Math.round(element.cornerRadius * dotsPerMm)}`;
        }
        zpl += `^FS`;
        break;

      case 'line':
        if (element.orientation === 'vertical') {
          zpl += `^GB${borderWidth},${height},${borderWidth},B^FS`;
        } else {
          zpl += `^GB${width},${borderWidth},${borderWidth},B^FS`;
        }
        break;

      case 'ellipse':
        // ^GE = Graphic Ellipse: width, height, border thickness, line color
        zpl += `^GE${width},${height},${thickness},B^FS`;
        break;

      default:
        zpl += `^GB${width},${height},${thickness},B^FS`;
    }

    return zpl;
  }
}
