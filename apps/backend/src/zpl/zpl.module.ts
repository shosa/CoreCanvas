import { Module } from '@nestjs/common';
import { ZplService } from './zpl.service';

@Module({
  providers: [ZplService],
  exports: [ZplService],
})
export class ZplModule {}
