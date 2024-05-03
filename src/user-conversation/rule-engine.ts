
import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { getComplaintDetails, getCorrespondingNarration, getEduMsg, PostRequest, PostRequestforTranslation } from "../utils/utils";
import { TransactionsRequestDto } from "src/banks/dto/transactions.dto";
import { BankName } from "@prisma/client";
import { response } from "express";
import { BanksService } from "src/banks/banks.service";
import { ComplaintRequestDto } from "src/banks/dto/complaint.dto";
import * as constants from "../utils/constants";
import { ExcessBankCharges } from "../use-cases/excessBankCharges"

@Injectable()
export class RuleEngine {
    constructor(
        private readonly logger: LoggerService,
        private prisma: PrismaService,
        private banksService: BanksService,
        private exchessBankChargesService: ExcessBankCharges
    ) { }

    async preprocessDataForMultipleUseCases(headers, reqData) {
        try {
            //check if session exists
            const sessionId = reqData.session_id
            let useCase

            let session = await this.prisma.sessions.findUnique({
                where: {
                    sessionId: sessionId,
                },
            })


            if (!session) {
                //detect language
                const message = reqData.message.text
                const languageDetectedresponse = await PostRequest(message, `${process.env.BASEURL}/ai/language-detect`)
                if (languageDetectedresponse.error) {
                    const exitResponse = [{
                        status: "Internal Server Error",
                        message: "Error in language detection",
                        end_connection: false
                    }]
                    return exitResponse
                }
                let languageDetected = languageDetectedresponse?.language


                if (languageDetected !== 'en') {
                    if (languageDetected === 'hi' || languageDetected === 'or' || languageDetected === 'ori') {
                        //convert the message to english
                        const translatedmessage = await PostRequestforTranslation(reqData.message.text, languageDetected, "en", `${process.env.BASEURL}/ai/language-translate`)

                        if (!translatedmessage.error) {
                            //Convert the language to englidh into the reqdata
                            reqData = { ...reqData, message: { "text": translatedmessage.translated } }
                        }
                        else {
                            return [{
                                status: "Internal Server Error",
                                "message": "Something went wrong with language translation",
                                "end_connection": false
                            }]
                        }
                    } else {
                        //throw error stating to change the message language (User to enter the query)
                        const lang_detected = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Please enter you query in english, hindi or odia",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata": {}
                        }]
                        // const msg = 'Please enter you query in english, hindi or odia'
                        //return proper formatted response

                        return lang_detected
                    }
                }
                // call 1st intent classifier that classifies the use case
                //mocking the response here
                const useCases = ["EXCESS_BANK_CHARGES", "LOAN_ENQUIRY", "CREDIT_CARD_NOT_DELIVERED", "DEBIT_CARD_PIN_RESET"]
                const index = Math.floor(Math.random() * (3 - 0)) + 0;
                useCase = useCases[0]

                //create session
                const metaData = reqData.metadata
                const phoneNumber = String(metaData.phoneNumber)
                const accountNumber = metaData.accountNumber
                const dob = metaData.dob
                let user = await this.prisma.users.findUnique({
                    where: {
                        phoneNumber: phoneNumber
                    }
                })
                if (!user) {
                    user = await this.prisma.users.create({
                        data: {
                            phoneNumber: phoneNumber,
                            languageDetected: languageDetected
                        }
                    })
                }
                else {
                    user = await this.prisma.users.update({
                        where: {
                            phoneNumber: phoneNumber
                        },
                        data: {
                            languageDetected: languageDetected
                        }
                    })
                }

                const languageByAdya = reqData.metadata.language

                const createdSession = await this.prisma.sessions.create({
                    data: {
                        user: {
                            connect: { id: user.id } // Use the actual user ID here
                        },
                        sessionId: sessionId,
                        state: 0,
                        bankAccountNumber: accountNumber,
                        initialQuery: message,
                        languageByAdya: languageByAdya,
                        useCase: useCase,
                        retriesLeft: 3
                    }
                })

            } else {
                useCase = session.useCase
            }

            let responses
            switch (useCase) {
                case "EXCESS_BANK_CHARGES":
                    responses = await this.exchessBankChargesService.preprocessData(headers, reqData)
                    break;
                case "LOAN_ENQUIRY":
                    console.log("LOAN_ENQUIRY")
                    break;
                case "CREDIT_CARD_NOT_DELIVERED":
                    console.log("CREDIT_CARD_NOT_DELIVERED")
                    break;
                case "DEBIT_CARD_PIN_RESET":
                    console.log("DEBIT_CARD_PIN_RESET")
                    break;
            }
            return responses
        } catch (error) {
            this.logger.error('error occured in state manager ', error)
            return error
        }
    }
}