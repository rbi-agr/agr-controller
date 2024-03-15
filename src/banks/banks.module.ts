import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { IndianBankService } from './services/indianBank.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [BanksService, PrismaService, IndianBankService],
  exports: [BanksService],
})
export class BanksModule {}
