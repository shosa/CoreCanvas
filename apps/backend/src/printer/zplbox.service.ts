import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';

@Injectable()
export class ZplBoxService {
  private readonly logger = new Logger(ZplBoxService.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ZPLBOX_URL', 'http://localhost:7272');
  }

  /**
   * Genera PDF da HTML con Puppeteer.
   * Le dimensioni del PDF corrispondono esattamente a quelle del canvas.
   * ZplBox poi applica Rotate90 se landscape, Rotate0 se portrait.
   */
  async htmlToPdf(html: string, widthMm: number, heightMm: number): Promise<Buffer> {
    this.logger.log(`Puppeteer PDF: ${widthMm}x${heightMm}mm`);

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * HTML → PDF portrait (Puppeteer) → ZplBox /v1/pdf2zpl/print/{ip:port}
   * Rotate0 perché il PDF è già in portrait (orientamento ZT410).
   */
  async printHtmlViaPdf(
    html: string,
    widthMm: number,
    heightMm: number,
    printerHost: string,
    printerPort = 9100,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`PDF print [${widthMm}x${heightMm}mm] → ${printerHost}:${printerPort}`);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await this.htmlToPdf(html, widthMm, heightMm);
      this.logger.log(`PDF generato: ${pdfBuffer.length} bytes`);
    } catch (err: any) {
      this.logger.error(`Puppeteer error: ${err.message}`);
      return { success: false, message: `Errore generazione PDF: ${err.message}` };
    }

    const dataBase64 = pdfBuffer.toString('base64');
    const tcpAddress = `${printerHost}:${printerPort}`;
    const url = `${this.baseUrl}/v1/pdf2zpl/print/${tcpAddress}`;
    // PDF landscape → ZplBox ruota di 90° per alimentazione portrait della ZT410
    const orientation = widthMm > heightMm ? 'Rotate90' : 'Rotate0';

    this.logger.log(`POST ${url} [${widthMm}x${heightMm}mm, ${orientation}]`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataBase64, dotsPerInch: 203, orientation }),
      });

      if (res.status === 204) {
        return { success: true, message: 'Etichetta inviata alla stampante' };
      }

      const text = await res.text().catch(() => '');
      return { success: false, message: `ZplBox error ${res.status}: ${text}` };
    } catch (err: any) {
      this.logger.error(`ZplBox non raggiungibile: ${err.message}`);
      return { success: false, message: `ZplBox non raggiungibile: ${err.message}` };
    }
  }

  async checkStatus(): Promise<{ online: boolean; url: string; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json().catch(() => ({})) as { status?: string };
        return {
          online: data.status === 'UP',
          url: this.baseUrl,
          message: data.status === 'UP' ? 'ZplBox operativo' : `Stato: ${data.status}`,
        };
      }
      return { online: false, url: this.baseUrl, message: `HTTP ${res.status}` };
    } catch (err: any) {
      return { online: false, url: this.baseUrl, message: `Non raggiungibile: ${err.message}` };
    }
  }
}
