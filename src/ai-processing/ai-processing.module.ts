import { Module } from '@nestjs/common';
import { AiProcessingService } from './ai-processing.service';
import { AiProcessingController } from './ai-processing.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import {LoggerService} from 'src/logger/logger.service'

@Module({
  controllers: [AiProcessingController],
  providers: [AiProcessingService, PrismaService, LoggerService],
})
export class AiProcessingModule {}
