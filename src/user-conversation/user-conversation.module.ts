import { Module } from '@nestjs/common'
import { UserConversationService } from './user-conversation.service'
import { ChatStateManager } from './state-manager'
import { LoggerService } from 'src/logger/logger.service'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  providers: [UserConversationService, ChatStateManager, LoggerService, PrismaService]
})
export class UserConversationModule {}
