import { Injectable } from '@nestjs/common';
import { IndianBankService } from './services/indianBank.service';
import { BankName } from '@prisma/client';
import { TransactionsRequestDto } from './dto/transactions.dto';
import { ComplaintRequestDto } from './dto/complaint.dto';

@Injectable()
export class BanksService {
    constructor(
        private indianBankService: IndianBankService
    ) {}

    async fetchTransactions(sessionId: string, data: TransactionsRequestDto, bankName: BankName) {

        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.fetchTransactions(sessionId, data);
        }
    }

    async registerComplaint(sessionId: string, data: ComplaintRequestDto, bankName: BankName) {

        switch(bankName) {
            case BankName.INDIAN_BANK:
                return this.indianBankService.registerComplaint(sessionId, data);
        }
    }
}
