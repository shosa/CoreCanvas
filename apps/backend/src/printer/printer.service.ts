import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as net from 'net';

@Injectable()
export class PrinterService implements OnModuleInit {
  private host: string;
  private port: number;
  private name: string;
  private dpi: number;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Defaults from env
    this.host = this.configService.get<string>('PRINTER_HOST') || '192.168.3.44';
    this.port = parseInt(this.configService.get<string>('PRINTER_PORT') || '9100', 10);
    this.dpi = parseInt(this.configService.get<string>('PRINTER_DPI') || '203', 10);
    this.name = 'Zebra ZT410';
  }

  async onModuleInit() {
    await this.loadConfigFromDb();
  }

  private async loadConfigFromDb() {
    try {
      const config = await this.prisma.printerConfig.findUnique({
        where: { id: 'default' },
      });
      if (config) {
        this.host = config.host;
        this.port = config.port;
        this.dpi = config.dpi;
        this.name = config.name;
      } else {
        // Create default record from env values
        await this.prisma.printerConfig.create({
          data: {
            id: 'default',
            name: this.name,
            host: this.host,
            port: this.port,
            dpi: this.dpi,
          },
        });
      }
    } catch {
      // Table may not exist yet (pre-migration), use env defaults
    }
  }

  async getConfig() {
    let config = await this.prisma.printerConfig.findUnique({
      where: { id: 'default' },
    });
    if (!config) {
      config = await this.prisma.printerConfig.create({
        data: {
          id: 'default',
          name: this.name,
          host: this.host,
          port: this.port,
          dpi: this.dpi,
        },
      });
    }
    return config;
  }

  async updateConfig(data: { name?: string; host?: string; port?: number; dpi?: number }) {
    const config = await this.prisma.printerConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        id: 'default',
        name: data.name || this.name,
        host: data.host || this.host,
        port: data.port || this.port,
        dpi: data.dpi || this.dpi,
      },
    });

    // Apply changes in-memory
    this.host = config.host;
    this.port = config.port;
    this.dpi = config.dpi;
    this.name = config.name;

    return config;
  }

  async sendZpl(zpl: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = 10000;

      socket.setTimeout(timeout);

      socket.connect(this.port, this.host, () => {
        socket.write(zpl, 'utf-8', err => {
          if (err) {
            socket.destroy();
            reject({ success: false, message: `Errore invio: ${err.message}` });
          } else {
            socket.end();
            resolve({ success: true, message: 'ZPL inviato alla stampante' });
          }
        });
      });

      socket.on('error', err => {
        socket.destroy();
        reject({
          success: false,
          message: `Errore connessione stampante (${this.host}:${this.port}): ${err.message}`,
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject({ success: false, message: 'Timeout connessione stampante' });
      });
    });
  }

  async checkStatus(): Promise<{ online: boolean; host: string; port: number; name: string; message: string }> {
    return new Promise(resolve => {
      const socket = net.createConnection({ host: this.host, port: this.port, timeout: 3000 });
      let settled = false;

      const done = (online: boolean, message: string) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve({ online, host: this.host, port: this.port, name: this.name, message });
      };

      socket.once('connect', () => done(true, 'Stampante raggiungibile'));
      socket.once('error', (err) => done(false, `Non raggiungibile: ${err.message}`));
      socket.once('timeout', () => done(false, 'Timeout connessione'));
    });
  }
}
