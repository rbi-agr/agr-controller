import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IndianBankService } from './services/indianBank.service';
import { BankName } from '@prisma/client';
import { TransactionsRequestDto, TransactionsResponseDto } from './dto/transactions.dto';
import { ComplaintRequestDto, ComplaintResponseDto } from './dto/complaint.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import jwt from 'jsonwebtoken';
import * as jwtConstants from '../auth/utils/constants';
import { AddBankDto } from './dto/addBank.dto';

var jwt = require('jsonwebtoken');

@Injectable()
export class BanksService {
    constructor(
        private indianBankService: IndianBankService,
        private prismaService: PrismaService
    ) {}

    async addBank(addBankDto: AddBankDto, authHeader: string) {
        const { bankId, bankName } = addBankDto;
        const tokenSecret = getTokenSecret(authHeader)
        if(tokenSecret !== jwtConstants.jwtSecret) {
            throw new UnauthorizedException("Invalid token secret")
        }
        const token = jwt.sign({ bankId }, jwtConstants.jwtSecret)
        await this.prismaService.bankToken.create({
            data: {
                bankId,
                bankName,
                token
            }
        });
        return token;
    }

    async updateToken(bankId: string, authHeader: string) {
        const tokenSecret = getTokenSecret(authHeader)
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

    async getBankToken(bankId: string, authHeader: string) {
        const tokenSecret = getTokenSecret(authHeader)
        if(tokenSecret !== jwtConstants.jwtSecret) {
            throw new UnauthorizedException("Invalid token secret")
        }
        const bank = await this.prismaService.bankToken.findUnique({
            where: { bankId }
        })
        if(!bank) {
            throw new UnauthorizedException("Bank not found")
        }
        return bank.token;
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

function getTokenSecret(authHeader) {
    if(!authHeader) {
        throw new UnauthorizedException("Token secret not provided")
    }
    // get secret from authorization header having basic auth username as secret
    const encodedTokenSecret = authHeader.split(' ')[1]
            
    // decode the secret
    let tokenSecret = Buffer.from(encodedTokenSecret, 'base64').toString('ascii')
    tokenSecret = tokenSecret.split(':')[0]
    return tokenSecret;
}