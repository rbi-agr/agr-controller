
import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import { PostRequest, PostRequestforTranslation, translatedResponse } from "../utils/utils";
import { BankName } from "@prisma/client";
import { BanksService } from "src/banks/banks.service";
import * as Sentry from '@sentry/node'
import { ChequeBookStatusRequestDto } from "src/banks/dto/chequeBook.dto";
import { getPrismaErrorStatusAndMessage } from "src/utils/handleErrors";

@Injectable()
export class ChequeBookStatus {
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
            if (languageDetected !== 'en') {

                const languageDetectedresponse = await PostRequest(reqData.message.text, `${process.env.BASEURL}/ai/language-detect`)
                if (languageDetectedresponse.error) {
                    Sentry.captureException("Cheque Book Status Error: Preprocess Language Translation Error")
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
                            Sentry.captureException("Cheque Book Status Error: Preprocess Language Translation Error")
                            this.logger.error("Cheque Book Status Error: Preprocess Language Translation Error:", translatedmessage.error)
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


            let response = await this.states(reqData, session.state)
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
            Sentry.captureException("Cheque Book Status Error: Preprocess Error")
            this.logger.error('Cheque Book Status Error: Preprocess Error:', error)
            return [{
                status: "Internal Server Error",
                message: "I'm sorry, something went wrong on my end",
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

    async states(reqData, state) {
        try {
            this.logger.info('Inside states')
            switch (state) {
                case 0:
                    const fres = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        message: "Have you applied for cheque book?",
                        options: ["Yes, I have", "No, I haven't"],
                        end_connection: false,
                        prompt: "option_selection"
                    }]
                    await this.prisma.sessions.update({
                        where: { sessionId: reqData.session_id },
                        data: {
                            state: 1
                        }
                    })
                    return fres

                case 1:
                    const message = reqData.message.text
                    if (message.toLowerCase().includes("yes")) {
                        const sessionId = reqData.session_id
                        const session = await this.prisma.sessions.findUnique({
                            where: {
                                sessionId: sessionId,
                            },
                        })
                        const st = session.state

                        const cheqBkStatusReq: ChequeBookStatusRequestDto = {
                            accountNumber: reqData.metadata.accountNumber,
                        }

                        const cheqBkStatusResponse = await this.banksService.chequeBookStatus(reqData.session_id, cheqBkStatusReq, BankName.INDIAN_BANK)
                        console.log('Cheque book response ', cheqBkStatusResponse)
                        if (cheqBkStatusResponse.error) {
                            const failMessage1 = cheqBkStatusResponse.message ?? 'No cheque book status found. Please make sure you have selected a valid bank account number and have applied for a cheque book'
                            return [{
                                status: "Internal Server Error",
                                message: failMessage1,
                                end_connection: false
                            }, {
                                status: "Success",
                                session_id: reqData.session_id,
                                message: "Please refresh to restart the conversation or select yes to end the conversation.",
                                options: ['Yes, end the conversation'],
                                end_connection: true,
                                prompt: "option_selection",
                                metadata: {}
                            }]
                        }
                        const name = cheqBkStatusResponse.name;
                        const trackingId = cheqBkStatusResponse.trackingId;
                        const bookingDate = cheqBkStatusResponse.bookingDate;

                        const response = `Name: ${name}\nTracking Id: ${trackingId}\nBooking Date: ${bookingDate}`

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
                    } else {
                        const elseres = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "Please apply for cheque book after logging into internet banking services.",
                            options: [],
                            end_connection: false,
                            prompt: "text"
                        }]
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 99
                            }
                        })
                        return elseres
                    }
                    break;
                    case 99:
                        this.logger.info('inside case 99')
                    const closeConnectionRes = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        message: "Thank You!",
                        options: [],
                        end_connection: true,
                        prompt: "text_message"
                    }]
                    return closeConnectionRes
            }



        } catch (error) {
            const errorStatus = getPrismaErrorStatusAndMessage(error)
            this.logger.error('error occured in state manager ', errorStatus.errorMessage)
            return [{
                status: "Internal Server Error",
                message: "I'm sorry, something went wrong on my end",
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