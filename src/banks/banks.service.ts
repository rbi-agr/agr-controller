import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IndianBankService } from './services/indianBank.service';
import { BankName } from '@prisma/client';
import { TransactionsRequestDto, TransactionsResponseDto } from './dto/transactions.dto';
import { ComplaintRequestDto, ComplaintResponseDto } from './dto/complaint.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import jwt from 'jsonwebtoken';
import * as jwtConstants from '../auth/utils/constants';

var jwt = require('jsonwebtoken');

@Injectable()
export class BanksService {
    constructor(
        private indianBankService: IndianBankService,
        private prismaService: PrismaService
    ) {}

    async generateToken(bankId: string, tokenSecret: string) {
        if(tokenSecret !== jwtConstants.jwtSecret) {
            throw new UnauthorizedException("Invalid token secret")
        }
        const bank = await this.prismaService.bankToken.findUnique({
            where: { bankId }
        })
        if(!bank) {
            throw new UnauthorizedException("Bank not found")
        }
        const token = jwt.sign({ bankId }, jwtConstants.jwtSecret)
        await this.prismaService.bankToken.update({
            where: { bankId },
            data: { token }
        })
        return token;
    }

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
}
