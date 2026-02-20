import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { ZplBoxService } from './zplbox.service';
import { PrinterController } from './printer.controller';
import { ZplModule } from '../zpl/zpl.module';

@Module({
  imports: [ZplModule],
  providers: [PrinterService, ZplBoxService],
  controllers: [PrinterController],
  exports: [PrinterService, ZplBoxService],
})
export class PrinterModule {}
