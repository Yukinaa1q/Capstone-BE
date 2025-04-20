import { Module } from '@nestjs/common';
import { WherebyService } from './whereby.service';

@Module({
  providers: [WherebyService],
  exports: [WherebyService],
})
export class WherebyModule {}
