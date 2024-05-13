import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { IndianBankService } from './services/indianBank.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {LoggerService} from 'src/logger/logger.service'
import { BanksController } from './banks.controller';

@Module({
  controllers: [BanksController],
  providers: [BanksService, PrismaService, IndianBankService, LoggerService],
  exports: [BanksService],
})
export class BanksModule {}
