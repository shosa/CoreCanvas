export class BarcodeHandler {
  toZpl(element: any, dotsPerMm: number): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const height = Math.round((element.barcodeHeight || 10) * dotsPerMm);
    const data = element.data || element.text || '';
    const showText = element.showText !== false ? 'Y' : 'N';
    const barcodeType = element.barcodeType || 'code128';
    const moduleWidth = element.moduleWidth || 2;
    const rotation = this.getRotation(element.rotation || 0);

    let zpl = `^FO${x},${y}`;
    zpl += `^BY${moduleWidth}`;

    switch (barcodeType.toLowerCase()) {
      case 'code128':
        zpl += `^BC${rotation},${height},${showText},N,N`;
        break;
      case 'code39':
        zpl += `^B3${rotation},N,${height},${showText},N`;
        break;
      case 'ean13':
        zpl += `^BE${rotation},${height},${showText},N`;
        break;
      case 'ean8':
        zpl += `^B8${rotation},${height},${showText},N`;
        break;
      case 'upca':
        zpl += `^BU${rotation},${height},${showText},N,N`;
        break;
      case 'code93':
        zpl += `^BA${rotation},${height},${showText},N,N`;
        break;
      case 'interleaved2of5':
      case 'itf':
        zpl += `^B2${rotation},${height},${showText},N,N`;
        break;
      default:
        zpl += `^BC${rotation},${height},${showText},N,N`;
    }

    zpl += `^FD${data}^FS`;
    return zpl;
  }

  private getRotation(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized >= 315 || normalized < 45) return 'N';
    if (normalized >= 45 && normalized < 135) return 'R';
    if (normalized >= 135 && normalized < 225) return 'I';
    return 'B';
  }
}
