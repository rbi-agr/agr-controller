import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { IndianBankService } from './services/indianBank.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BankController } from './banks.controller';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [BanksService, PrismaService, IndianBankService],
  controllers: [BankController],
  exports: [BanksService],
})
export class BanksModule {}
