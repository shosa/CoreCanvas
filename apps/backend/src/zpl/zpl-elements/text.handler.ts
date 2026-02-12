export class TextHandler {
  toZpl(element: any, dotsPerMm: number): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const fontSize = Math.round((element.fontSize || 12) * dotsPerMm);
    const text = element.text || '';

    // ZPL font: ^A0 = scalable font
    // Rotation: N=normal, R=90, I=180, B=270
    const rotation = this.getRotation(element.rotation || 0);

    let zpl = `^FO${x},${y}`;

    // ^FR = Field Reverse Print (white text on black background)
    if (element.inverted) {
      zpl += `^FR`;
    }

    zpl += `^A0${rotation},${fontSize},${fontSize}`;

    if (element.bold) {
      // Simulate bold with slightly wider font
      zpl = `^FO${x},${y}`;
      if (element.inverted) {
        zpl += `^FR`;
      }
      zpl += `^A0${rotation},${fontSize},${Math.round(fontSize * 1.1)}`;
    }

    zpl += `^FD${this.escapeZpl(text)}^FS`;

    return zpl;
  }

  private getRotation(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized >= 315 || normalized < 45) return 'N';
    if (normalized >= 45 && normalized < 135) return 'R';
    if (normalized >= 135 && normalized < 225) return 'I';
    return 'B';
  }

  private escapeZpl(text: string): string {
    return text.replace(/\^/g, '').replace(/~/g, '');
  }
}
