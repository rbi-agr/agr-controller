import { Injectable } from '@nestjs/common';
import { IndianBankService } from './services/indianBank.service';
import { BankName } from '@prisma/client';
import { TransactionsDto } from './dto/transactions.dto';
import { ComplaintDto } from './dto/complaint.dto';

@Injectable()
export class BanksService {
    constructor(
        private indianBankService: IndianBankService
    ) {}

    async fetchTransactions(sessionId: string, data: TransactionsDto, bankName: BankName) {

        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.fetchTransactions(sessionId, data);
        }
    }

    async registerComplaint(sessionId: string, data: ComplaintDto, bankName: BankName) {

        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.registerComplaint(sessionId, data);
        }
    }
}
