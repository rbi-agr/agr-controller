import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { IndianBankService } from './services/indianBank.service';

@Module({
  providers: [BanksService, IndianBankService],
})
export class BanksModule {}
