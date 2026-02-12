import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { ZplModule } from '../zpl/zpl.module';

@Module({
  imports: [ZplModule],
  providers: [PrinterService],
  controllers: [PrinterController],
  exports: [PrinterService],
})
export class PrinterModule {}
