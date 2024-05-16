
import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import { PostRequest, PostRequestforTranslation, translatedResponse } from "../utils/utils";
import { BankName } from "@prisma/client";
import { BanksService } from "src/banks/banks.service";
import { LoanAccountBalanceRequestDto } from "src/banks/dto/loanbalance.dto";
import * as Sentry from '@sentry/node'
import { getPrismaErrorStatusAndMessage } from "src/utils/handleErrors";

@Injectable()
export class LoanAccountStatus {
    constructor(
        private readonly logger: LoggerService,
        private prisma: PrismaService,
        private banksService: BanksService
    ) { }

    async preprocessData(headers, reqData) {
        try {
            //check if session exists
            const sessionId = reqData.session_id

            let session = await this.prisma.sessions.findUnique({
                where: {
                    sessionId: sessionId,
                },
            })

            let languageDetected = reqData.metadata?.language;
            if(languageDetected !== 'en') {

                const languageDetectedresponse = await PostRequest(reqData.message.text, `${process.env.BASEURL}/ai/language-detect`)

                if (languageDetectedresponse.error) {
                    const exitResponse = [{
                        status: "Internal Server Error",
                        message: "Error in language detection",
                        end_connection: false
                    }]
                    return exitResponse
                }
                languageDetected = languageDetectedresponse?.language

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
            }
            //Check lang from adya
            if (session && session?.languageByAdya !== languageDetected) {
                languageDetected = session.languageByAdya
            } else if (reqData?.metadata?.language && reqData.metadata.language !== languageDetected) {
                //Case 0
                languageDetected = reqData.metadata.language
            }

            let response = await this.states(reqData)
            // Check if the language detected is "en"
            let messageTranslation = ""

            const updatedSession = await this.prisma.sessions.findUnique({
                where: {
                    sessionId: reqData.session_id
                }
            })
            if (languageDetected !== "en") {
                //convert the message to Language detected and return
                //Translator API

                let translatedresponse = await translatedResponse(response, languageDetected, reqData.session_id, this.prisma)
                console.log("translatedresponse", translatedresponse)
                response = translatedresponse
            }

            //Store messages in db
            await this.prisma.messages.create({
                data: {
                    sessionId: reqData.session_id,
                    userId: session.userId,
                    sender: "user",
                    message: reqData.message.text || "",
                    messageTranslation: "",
                    languageDetected: languageDetected || "",
                    promptType: "text_message",
                    options: [],
                    timeStamp: new Date()
                }
            })

            //2. Store the response from chatbot
            response?.forEach(async (e: any) => {
                await this.prisma.messages.create({
                    data: {
                        sessionId: reqData.session_id,
                        userId: 'db5084e1-babf-4a83-953f-f14b1f9a9e89',
                        sender: "chatbot",
                        message: e?.message || "",
                        messageTranslation: messageTranslation || "",
                        languageDetected: languageDetected || "",
                        promptType: e?.prompt || "",
                        options: e?.options || [],
                        timeStamp: new Date()
                    }
                })
            })
            return response
        } catch (error) {
            Sentry.captureException("Loan Account Status Error: Preprocess Error")
            this.logger.error('Loan Account Status Error: Preprocess Error', error)
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
                Sentry.captureException("Loan Account Status Error: Fetching Loan Account Balance Error")
                //this.logger.error("Loan Account Status Error: Fetching Loan Account Balance Error:", loanAccBalResponse.error)

                // await this.prisma.sessions.update({
                //     where: { sessionId: reqData.session_id },
                //     data: {
                //         state: 20
                //     }
                // })
                const failMessage = loanAccBalResponse.message ?? "I could not fetch your loan account balance. Please try again later."
                return [{
                    status: "Internal Server Error",
                    message: failMessage,
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
            const response = `Total Out-Standing: ${totalOutstanding}\nPrincipal Out-Standing: ${principalOutstanding}\nInterest Paid: ${interestPaid}`
            
            const fres = [{
                status: "Success",
                session_id: sessionId,
                message: response,
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
            const errorStatus = getPrismaErrorStatusAndMessage(error)
            Sentry.captureException("Loan Account Status Error: State Manager Error")
            this.logger.error('Loan Account Status Error: State Manager Error:', errorStatus.errorMessage)
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