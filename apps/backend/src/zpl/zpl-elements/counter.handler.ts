import { PrismaService } from '../../prisma/prisma.service';

export class CounterHandler {
  constructor(private prisma: PrismaService) {}

  async toZpl(element: any, dotsPerMm: number): Promise<string> {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const fontSize = Math.round((element.fontSize || 12) * dotsPerMm);
    const counterName = element.counterName || 'default';
    const rotation = this.getRotation(element.rotation || 0);

    // Get and increment counter
    let counter = await this.prisma.counter.findUnique({
      where: { name: counterName },
    });

    if (!counter) {
      counter = await this.prisma.counter.create({
        data: {
          name: counterName,
          value: element.startValue || 1,
          prefix: element.prefix || '',
          padding: element.padding || 0,
        },
      });
    } else {
      counter = await this.prisma.counter.update({
        where: { name: counterName },
        data: { value: counter.value + 1 },
      });
    }

    const paddedValue = counter.padding > 0
      ? String(counter.value).padStart(counter.padding, '0')
      : String(counter.value);
    const formattedValue = `${counter.prefix}${paddedValue}`;

    let zpl = `^FO${x},${y}`;
    zpl += `^A0${rotation},${fontSize},${fontSize}`;
    zpl += `^FD${formattedValue}^FS`;

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
