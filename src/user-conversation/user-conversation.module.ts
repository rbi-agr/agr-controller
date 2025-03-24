import { Module } from '@nestjs/common'
import { UserConversationService } from './user-conversation.service'
import { LoggerService } from 'src/logger/logger.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { BanksModule } from 'src/banks/banks.module'
import { UserConversationController } from './user-conversation.controller'
import { RuleEngine } from './rule-engine'
import { ExcessBankCharges } from 'src/use-cases/excessBankCharges'
import { LoanAccountStatus } from 'src/use-cases/loanAccountStatus'
import { NeftRtgsStatus } from 'src/use-cases/neftRtgsStatus'
import { ChequeBookStatus } from 'src/use-cases/chequeBookStatus'
import { RolesGuard } from '../utils/roles.guard'

@Module({
  imports: [BanksModule],
  providers: [RolesGuard, UserConversationService, LoggerService, PrismaService, RuleEngine, ExcessBankCharges, LoanAccountStatus, NeftRtgsStatus, ChequeBookStatus],
  controllers:[UserConversationController]
})
export class UserConversationModule {}
