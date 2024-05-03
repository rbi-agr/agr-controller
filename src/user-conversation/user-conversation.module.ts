import { Module } from '@nestjs/common'
import { UserConversationService } from './user-conversation.service'
import { ChatStateManager } from './state-manager'
import { LoggerService } from 'src/logger/logger.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { BanksModule } from 'src/banks/banks.module'
import { UserConversationController } from './user-conversation.controller'
import { RuleEngine } from './rule-engine'
import { ExcessBankCharges } from 'src/use-cases/excessBankCharges'

@Module({
  imports: [BanksModule],
  providers: [UserConversationService, ChatStateManager, LoggerService, PrismaService, RuleEngine, ExcessBankCharges],
  controllers:[UserConversationController]
})
export class UserConversationModule {}
