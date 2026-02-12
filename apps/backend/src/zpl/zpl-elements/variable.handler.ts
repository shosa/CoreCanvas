export class VariableHandler {
  toZpl(element: any, dotsPerMm: number, variables?: Record<string, string>): string {
    const x = Math.round(element.x * dotsPerMm);
    const y = Math.round(element.y * dotsPerMm);
    const fontSize = Math.round((element.fontSize || 12) * dotsPerMm);
    const variableName = element.variableName || '';
    const rotation = this.getRotation(element.rotation || 0);

    // Resolve variable value
    const value = variables?.[variableName] || element.defaultValue || `{{${variableName}}}`;

    let zpl = `^FO${x},${y}`;
    zpl += `^A0${rotation},${fontSize},${fontSize}`;
    zpl += `^FD${value}^FS`;

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
