import { Injectable } from '@nestjs/common';
import { IndianBankService } from './services/indianBank.service';
import { BankName } from '@prisma/client';
import { TransactionsRequestDto, TransactionsResponseDto } from './dto/transactions.dto';
import { ComplaintRequestDto, ComplaintResponseDto } from './dto/complaint.dto';
import { LoanAccountBalanceRequestDto } from './dto/loanbalance.dto';
import { ChequeBookStatusRequestDto } from './dto/chequeBook.dto';

@Injectable()
export class BanksService {
    constructor(
        private indianBankService: IndianBankService
    ) {}

    async fetchTransactions(sessionId: string, data: TransactionsRequestDto, bankName: BankName): Promise<TransactionsResponseDto> {

        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.fetchTransactions(sessionId, data);
        }
    }

    async registerComplaint(sessionId: string, data: ComplaintRequestDto, bankName: BankName): Promise<ComplaintResponseDto> {

        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.registerComplaint(sessionId, data);
        }
    }

    async getLoanAccountBalance(sessionId: string, data: LoanAccountBalanceRequestDto, bankName: BankName) {
        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.getLoanAccountBalance(sessionId, data);
        }
    }

    async chequeBookStatus(sessionId: string, data: ChequeBookStatusRequestDto, bankName: BankName) {
        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.chequeBookStatus(sessionId, data);
        }
    }

    async createNarrationsForIndianBank(body) {
        try {
            return await this.indianBankService.createNarrations(body)
        } catch(error) {
            throw new Error(error.response?.data ?? error.message);
        }
    }

    async getAllNarations() {
        try {
            return await this.indianBankService.getAllNarrations()
        } catch(error) {
            throw new Error(error.response?.data ?? error.message);
        }
    }
}
