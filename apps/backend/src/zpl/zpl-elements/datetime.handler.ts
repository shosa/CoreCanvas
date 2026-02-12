export class DatetimeHandler {
  toZpl(element: any, dotsPerMm: number): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const fontSize = Math.round((element.fontSize || 12) * dotsPerMm);
    const format = element.dateFormat || 'dd/MM/yyyy HH:mm';
    const rotation = this.getRotation(element.rotation || 0);

    const now = new Date();
    const formatted = this.formatDate(now, format);

    let zpl = `^FO${x},${y}`;
    zpl += `^A0${rotation},${fontSize},${fontSize}`;
    zpl += `^FD${formatted}^FS`;

    return zpl;
  }

  private getRotation(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized >= 315 || normalized < 45) return 'N';
    if (normalized >= 45 && normalized < 135) return 'R';
    if (normalized >= 135 && normalized < 225) return 'I';
    return 'B';
  }

  private formatDate(date: Date, format: string): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year)
      .replace('yy', year.slice(-2))
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }
}
