
import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import { PostRequest, PostRequestforTranslation } from "../utils/utils";
import { ExcessBankCharges } from "../use-cases/excessBankCharges"
import { LoanAccountStatus } from "src/use-cases/loanAccountStatus";
import { NeftRtgsStatus } from "src/use-cases/neftRtgsStatus";
import { ChequeBookStatus } from "src/use-cases/chequeBookStatus";
import * as Sentry from '@sentry/node'

@Injectable()
export class RuleEngine {
    constructor(
        private readonly logger: LoggerService,
        private prisma: PrismaService,
        private exchessBankChargesService: ExcessBankCharges,
        private loanAccountStatus: LoanAccountStatus,
        private neftRtgsStatus: NeftRtgsStatus,
        private chequeBookStatus: ChequeBookStatus,

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

                const languageByAdya = reqData.metadata?.language
                let languageDetected = languageByAdya
                if (languageByAdya !== 'en') {
                    const languageDetectedresponse = await PostRequest(message, `${process.env.BASEURL}/ai/language-detect`)
                    if (languageDetectedresponse.error) {
                        Sentry.captureException("Rule Engine Error: Language Detection API Error")
                        this.logger.error("Rule Engine Error: Language Detection API Error:", languageDetectedresponse.error)
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
                                Sentry.captureException("Rule Engine Error: Language Translation API Error")
                                this.logger.error("Rule Engine Error: Language Translation API Error:",translatedmessage.error)
                                return [{
                                    status: "Internal Server Error",
                                    "message": "I am having trouble translating your query. Please make sure the query is correctly typed and try again",
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
                            return lang_detected
                        }
                    }
                }
                // call 1st intent classifier that classifies the use case
                //mocking the response here

                useCase = await this.checkUseCase(reqData.message.text)


                //call sentiment-analysis
                // const sentimentResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/sentiment-analysis`)

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
                        intialSentiment: '',
                        intialSentimentScore: 0.0,
                        retriesLeft: 3
                    }
                })

            } else {
                useCase = session.useCase
                //add retries here
                if(!useCase || useCase == 'Other') {
                    if(session.retriesLeft > 0) {
                        //call rule-engine to get the useCase and decrease the number of retry
                        //if use case isnt found decrease the number of retry and return asking to retry
                        useCase = await this.checkUseCase(reqData.message.text)

                        await this.prisma.sessions.update({
                            data: {
                                retriesLeft: session.retriesLeft - 1,
                                useCase: useCase,
                            },
                            where: {
                                sessionId: reqData.session_id,
                            },
                        })
                    } else {
                        const closeConnectionRes = [{
                            status: "Success",
                            session_id: sessionId,
                            message: "You have reached you maximum retries limit. Please try again after some time. Thank You!",
                            options: [],
                            end_connection: true,
                            prompt: "text_message"
                        }]
                        return closeConnectionRes
                    }
                }
            }

            if(useCase == 'Other') {
                return [{
                    "success": "true",
                    "message":"I apologize, but I didn't quite understand that. Could you please rephrase your question?",
                    "options": [],
                    "end_connection": false,
                    "prompt": "text_message",
                    "metadata":{}
                }]
            }

            let responses
            switch (useCase) {
                case "EXCESS_BANK_CHARGES":
                    responses = await this.exchessBankChargesService.preprocessData(headers, reqData)
                    break;
                case "LOAN_ENQUIRY":
                    responses = await this.loanAccountStatus.preprocessData(headers, reqData)
                    break;
                case "NEFT":
                case "RTGS":
                    responses = await this.neftRtgsStatus.preprocessData(headers, reqData)
                    break;
                case "CHEQUE_BOOK":
                    responses = await this.chequeBookStatus.preprocessData(headers, reqData)
                    break;
            }
            return responses
        } catch (error) {
            Sentry.captureException("Rule Engine Error: Multi Use-Case Preprocess Error")
            this.logger.error('Rule Engine Error: Multi Use-Case Preprocess Error:', error)
            return error
        }
    }

    async checkUseCase(text) {
        let ruleResponse = await PostRequest(text, `${process.env.BASEURL}/ai/intent-classifier`)
        if (ruleResponse.error) {
            Sentry.captureException("Check Use Case Error")
            this.logger.error("Check Use Case Error", ruleResponse.error)
            ruleResponse = await PostRequest(text, `${process.env.BASEURL}/ai/rule-engine`)
        } else {
            ruleResponse = {
                useCase: "EXCESS_BANK_CHARGES"
            }
        }

        return ruleResponse.useCase
    }
}