
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

            let ruleResponse

            if (!session) {
                //detect language
                const message = reqData.message.text
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
                            Sentry.captureException("Rule Engine Error: Language Translation API Error")
                            this.logger.error("Rule Engine Error: Language Translation API Error:",translatedmessage.error)
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

                ruleResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/intent-classifier`)
                if(ruleResponse.error) {
                    ruleResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/rule-engine`)
                } else {
                    ruleResponse = {
                        useCase: "OTHERS"
                    }
                }
                
                useCase = ruleResponse.useCase


                //call sentiment-analysis
                const sentimentResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/sentiment-analysis`)

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
                        intialSentiment: sentimentResponse.sentiment_label,
                        intialSentimentScore: sentimentResponse.sentiment_score,
                        retriesLeft: 3
                    }
                })

            } else {
                useCase = session.useCase
                //add retries here
                if(session.retriesLeft>0 && !useCase){
                    //call rule-engine to get the useCase and decrease the number of retry
                    //if use case isnt found decrease the number of retry and return asking to retry
                    ruleResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/intent-classifier`)
                    if(ruleResponse.error) {
                        ruleResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/rule-engine`)
                    } else {
                        ruleResponse = {
                            useCase: "OTHERS"
                        }
                    }
                    await this.prisma.sessions.update({
                        data: {
                          retriesLeft: session.retriesLeft - 1,
                        },
                        where: {
                          sessionId: reqData.session_id,
                        },
                      })
                }
            }

            let responses
            switch (useCase) {
                case "OTHERS":
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
}