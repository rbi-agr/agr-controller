
import { Injectable} from "@nestjs/common";
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
            const message = reqData.message.text

            //exclude the states not used for language detection
            const statesExcludedForLangDetect = [4, 9, 7, 14, 15];
            
            const detectLang = !session || !statesExcludedForLangDetect.includes(session.state) || (session.state == 4 && !message.includes("|"))

            let languageDetected;
            
            if(detectLang) {
                const languageDetectedresponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/language-detect`)
                // const languageDetectedresponse = {
                //     language: 'en',
                //     error: null
                // }
                //Update the language detected in Adya
                
                if(languageDetectedresponse.error){
                    const exitResponse =  [{
                        status: "Internal Server Error",
                        message: "Error in language detection",
                        end_connection: false
                    }]
                    return exitResponse
                }
                languageDetected = languageDetectedresponse?.language
                        
                
                if(languageDetected !== 'en') {
                    if(languageDetected === 'hi' || languageDetected === 'or'|| languageDetected === 'ori'){
                        //convert the message to english
                        const translatedmessage = await PostRequestforTranslation(reqData.message.text,languageDetected,"en",`${process.env.BASEURL}/ai/language-translate`)
                        
                        if(!translatedmessage.error){
                            //Convert the language to englidh into the reqdata
                            reqData ={...reqData,message:{"text":translatedmessage.translated}}
                        }
                        else{
                            return[{
                                status: "Internal Server Error",
                                "message": "Something went wrong with language translation",
                                "end_connection": false
                            }]
                        }
                    }else {
                        //throw error stating to change the message language (User to enter the query)
                        const lang_detected=[{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Please enter you query in english, hindi or odia",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                        }]
                        // const msg = 'Please enter you query in english, hindi or odia'
                        //return proper formatted response
                        
                        return lang_detected
                    }
                }
                //Check lang from adya
                if(session && session?.languageByAdya!==languageDetected)
                {
                    languageDetected = session.languageByAdya
                }else if(reqData?.metadata?.language && reqData.metadata.language!==languageDetected)
                {
                    //Case 0
                    languageDetected = reqData.metadata.language
                }
            } else {
                const user = await this.prisma.users.findUnique({
                    where: {
                        id: session.userId
                    }
                })
                // languageDetected = user.languageDetected
                if(session && session?.languageByAdya!==languageDetected)
                {
                    languageDetected = session.languageByAdya
                }
                else{
                    languageDetected = user.languageDetected
                }
                
            }
            //if it doesnt then create a session in db, check the language and then call states
            let state
            if (!session) {
                state = 0
            } else {
                //add a retry in the db max 3 tries
                if(session.retriesLeft<=0) {
                    const intentFailRes = [{
                        "status": "Bad Request",
                        message: "Maximum retries limit reached. Please try again later.",
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
                    await this.prisma.sessions.update({
                        where: { sessionId: reqData.session_id },
                        data: {
                            state: 20
                        }
                    })
                    return intentFailRes
                } 
                if(message.length === 0) {
                    await this.prisma.sessions.update({
                        where: { sessionId: reqData.session_id },
                        data: {
                            retriesLeft: {
                                decrement: 1
                            }
                        }
                    });
                    return [{
                        status: "Bad Request",
                        message: "Please enter a valid query",
                        end_connection: false
                    }]
                }
                state = session.state
            }
            if(state == 99) {
                const exitResponse =  [{
                    status: "Bad Request",
                    message: "This session has already ended please start a new session if you have a query!",
                    end_connection: true
                }]
                return exitResponse
            }
            let response = await this.states(reqData, languageDetected, state)
            // Check if the language detected is "en"
            let messageTranslation=""

            const updatedSession = await this.prisma.sessions.findUnique({
                where:{
                    sessionId:reqData.session_id
                }
            })
            if(languageDetected!=="en")
            {
                //convert the message to Language detected and return
                //Translator API
                
                let translatedresponse = await translatedResponse(response, languageDetected, reqData.session_id)
                console.log("translatedresponse",translatedresponse)
                response=translatedresponse
            }
            //Store messages in db
            //Access user
            
            //1. Store the request from user
            if(state != 0) {
                await this.prisma.messages.create({
                    data:{
                        sessionId: reqData.session_id,
                        userId: session.userId,
                        sender:"user",
                        message: reqData.message.text||"",
                        messageTranslation:"",
                        languageDetected:languageDetected||"",
                        promptType:"text_message",
                        options:[],
                        timeStamp: new Date()
                    }
                })
            }
            
            //2. Store the response from chatbot
            response?.forEach(async(e:any)=>
            {
                await this.prisma.messages.create({
                    data:{
                        sessionId: reqData.session_id,
                        userId: 'db5084e1-babf-4a83-953f-f14b1f9a9e89',
                        sender:"chatbot",
                        message: e?.message||"",
                        messageTranslation:messageTranslation||"",
                        languageDetected:languageDetected||"",
                        promptType:e?.prompt||"",
                        options:e?.options||[],
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

    async states(reqData, languageDetected, state) {
        try {
            this.logger.info('Inside states')
        }  catch (error) {
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