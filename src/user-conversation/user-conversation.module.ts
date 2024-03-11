import { Module } from '@nestjs/common'
import { UserConversationService } from './user-conversation.service'
import { ChatStateManager } from './state-manager'
import { LoggerService } from 'src/logger/logger.service'

@Module({
  providers: [UserConversationService, ChatStateManager, LoggerService]
})
export class UserConversationModule {}
