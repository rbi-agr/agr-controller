
import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { formatDate, getComplaintDetails, getCorrespondingNarration, getEduMsg, PostRequest, PostRequestforTransactionDates, PostRequestforTranslation, translatedResponse, validstate } from "../utils/utils";
import { TransactionsRequestDto } from "src/banks/dto/transactions.dto";
import { BankName } from "@prisma/client";
import { response } from "express";
import { BanksService } from "src/banks/banks.service";
import { ComplaintRequestDto } from "src/banks/dto/complaint.dto";
import * as constants from "../utils/constants"
import { LoanAccountBalanceRequestDto } from "src/banks/dto/loanbalance.dto";

@Injectable()
export class LoanAccountStatus {
    constructor(
        private readonly logger: LoggerService,
        private prisma: PrismaService,
        private banksService: BanksService
    ) { }

    async preprocessData(headers, reqData) {
        try {
            const sessionId = reqData.session_id

            let session = await this.prisma.sessions.findUnique({
                where: {
                    sessionId: sessionId,
                },
            })

            let response = await this.states(reqData)

            response?.forEach(async (e: any) => {
                await this.prisma.messages.create({
                    data: {
                        sessionId: reqData.session_id,
                        userId: 'db5084e1-babf-4a83-953f-f14b1f9a9e89',
                        sender: "chatbot",
                        message: e?.message || "",
                        messageTranslation: "",
                        languageDetected: "",
                        promptType: e?.prompt || "",
                        options: e?.options || [],
                        timeStamp: new Date()
                    }
                })
            })
            return response
        } catch (error) {
            this.logger.error('error occured in state manager ', error)
            return [{
                status: "Internal Server Error",
                message: "Something went wrong. Please try again later",
                end_connection: false
            }, {
                status: "Success",
                session_id: reqData.session_id,
                message: "Please refresh to restart the conversation",
                options: [],
                end_connection: false,
                prompt: "option_selection",
                metadata: {}
            }]
        }
    }

    async states(reqData) {
        try {

            this.logger.info('Inside loan account status')
            const sessionId = reqData.session_id
            const session = await this.prisma.sessions.findUnique({
                where: {
                    sessionId: sessionId,
                },
            })
            const st = session.state

            const loanAccBalReq: LoanAccountBalanceRequestDto = {
                accountNumber: reqData.metadata.accountNumber,
            }

            const loanAccBalResponse = await this.banksService.getLoanAccountBalance(reqData.session_id, loanAccBalReq, BankName.INDIAN_BANK)
            console.log('Loan account response ', loanAccBalResponse)
            if (loanAccBalResponse.error) {
                // await this.prisma.sessions.update({
                //     where: { sessionId: reqData.session_id },
                //     data: {
                //         state: 20
                //     }
                // })
                return [{
                    status: "Internal Server Error",
                    message: `I received the following error from the bank: ${loanAccBalResponse.message}`,
                    end_connection: false
                }, {
                    status: "Success",
                    session_id: reqData.session_id,
                    message: "Please refresh to restart the conversation or select yes to end the conversation.",
                    options: ['Yes, end the conversation'],
                    end_connection: false,
                    prompt: "option_selection",
                    metadata: {}
                }]
            }
            const totalOutstanding = loanAccBalResponse.totalOutstanding
            const principalOutstanding = loanAccBalResponse.principalOutstanding
            const interestPaid = loanAccBalResponse.interestPaid
            const response = {
                totalOutstanding: totalOutstanding,
                principalOutstanding: principalOutstanding,
                interestPaid: interestPaid
            }
            const fres = [{
                status: "Success",
                session_id: sessionId,
                message: JSON.stringify(response),
                options: [],
                end_connection: false,
                prompt: "text_message"
            }, {
                status: "Success",
                session_id: sessionId,
                message: "Thank You!",
                options: [],
                end_connection: true,
                prompt: "text_message"
            }
            ]
            await this.prisma.sessions.update({
                where: { sessionId: reqData.session_id },
                data: {
                    state: 99
                }
            })

            return fres

        } catch (error) {
            this.logger.error('error occured in state manager ', error)
            return [{
                status: "Internal Server Error",
                message: "Something went wrong. Please try again later",
                end_connection: false
            }, {
                status: "Success",
                session_id: reqData.session_id,
                message: "Please refresh to restart the conversation",
                options: [],
                end_connection: false,
                prompt: "option_selection",
                metadata: {}
            }]
        }
    }
}