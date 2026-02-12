export class QrcodeHandler {
  toZpl(element: any, dotsPerMm: number): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const data = element.data || element.text || '';
    const magnification = element.magnification || 4;
    const errorCorrection = element.errorCorrection || 'M';

    // ^BQN,2,magnification = QR Code
    // Error correction: H=high, Q=quartile, M=medium, L=low
    let zpl = `^FO${x},${y}`;
    zpl += `^BQN,2,${magnification}`;
    zpl += `^FD${errorCorrection}A,${data}^FS`;

    return zpl;
  }
}
