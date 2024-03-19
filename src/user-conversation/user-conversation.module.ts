import { Module } from '@nestjs/common'
import { UserConversationService } from './user-conversation.service'
import { ChatStateManager } from './state-manager'
import { LoggerService } from 'src/logger/logger.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { BanksModule } from 'src/banks/banks.module'

@Module({
  imports: [BanksModule],
  providers: [UserConversationService, ChatStateManager, LoggerService, PrismaService]
})
export class UserConversationModule {}
