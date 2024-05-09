
import { Injectable} from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { formatDate, getComplaintDetails, getCorrespondingNarration, getEduMsg, PostRequest, PostRequestforTransactionDates, PostRequestforTranslation, translatedResponse, validstate } from "../utils/utils";
import { TransactionsRequestDto } from "src/banks/dto/transactions.dto";
import { BankName } from "@prisma/client";
import { response } from "express";
import { BanksService } from "src/banks/banks.service";

@Injectable()
export class NeftRtgsStatus {
    constructor(
        private readonly logger: LoggerService,
        private prisma: PrismaService,
        private banksService: BanksService
    ) { }

    async preprocessData(headers, reqData) {
        try {
            console.log("NEFT & RTGS use case called")
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

    async states(reqData, languageDetected, state:any) {
        try {
            //TODO Decide the states and then try to reimplement . Currently the use case is depriotised and will picl this in future
            console.log("neft/rtgs states called")
            this.logger.info('Inside states')
            let msg = ''
            let session;
            let sessionId: string;
            console.log("state", state)
            switch(state){
                case 0:
                    // user posts query, make socket connection and create a session for the chat with sessionId and retries left
                    this.logger.info('inside case 0')
                    const message = reqData.message.text
                    sessionId = reqData.session_id
                    
                    //detect language here
                    //TODO remove as it is not used
                    const languageByAdya = reqData.metadata.language
                    
                    const createdSession = await this.prisma.sessions.findFirst({
                        where: {
                            sessionId: sessionId
                        }
                    })
                    if(createdSession) {
                        // check if initial query is empty and ask if it is empty
                        if(!message) {
                            await this.prisma.sessions.update({
                                data: {
                                  retriesLeft: reqData.session_id.retriesLeft - 1,
                                },
                                where: {
                                  sessionId: reqData.session_id,
                                },
                              })

                            return [{
                                "success": "true",
                                "message":"Please enter your query",
                                "options": [],
                                "end_connection": false,
                                "prompt": "text_message",
                                "metadata":{}
                            }]
                        }

                        
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:1
                            }
                        })
                        await this.prisma.messages.create({
                            data:{
                                sessionId: reqData.session_id,
                                userId: createdSession.userId,
                                sender:"user",
                                message: message||"",
                                messageTranslation:"",
                                languageDetected:languageDetected||"",
                                promptType:"text_message",
                                options:[],
                                timeStamp: new Date()
                            }
                        })
                        
                        
                       const stateCreationRes = await this.states(reqData, languageDetected, 1)
                       return stateCreationRes
                    } else {
                        const stateFailRes = [{
                            status: "Bad Request",
                            message: "Please try again.",
                            end_connection: false
                        }]
                        return  stateFailRes
                    }
                    break;
                case 1:
                    //Checks for the user query intent and the left retries as a validation layer
                    this.logger.info('inside case 1')
                    const messageForIntent = reqData.message.text
                    let sessionForIntent = await this.prisma.sessions.findUnique({
                        where: {
                            sessionId: reqData.session_id
                        }
                    })

                    // Recheck for valid query and end connection if retries are over
                    if(sessionForIntent && sessionForIntent.retriesLeft<=0) {
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
                    if(messageForIntent.length === 0) {
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
                    await this.prisma.sessions.update({
                        where:{ sessionId: reqData.session_id },
                        data:{
                            initialQuery: messageForIntent
                        }
                    })
                    //TODO remove the commented lines after discussion as the API reponse in this case do not have the same format
                    //get the intial query and check for intent which will give us category id, category, subcategory, subtype stored in db
                    //call intent api

                    // const intentResponse = {
                    //     categoryId: '450',
                    //     category: 'category',
                    //     subtype: 'subtype',
                    //     type: 'type',
                    //     error: null
                    // }
                    // const intentResponse = await this.PostRequest(reqData.message.text,`${process.env.BASEURL}/intentclassifier`)
                    // const intentResponse = {
                    //     category: 'category',
                    //     subtype: 'subtype',
                    //     type: 'type',
                    //     error: null
                    // }

                    //Updated the API from `/ai/intent-classifier` to `/ai/rule-engine` as for the NEFT & RTGS use cases the API `/ai/intent-classifier` gives the response "Out of Scope"
                    const intentResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/rule-engine`)
                    //console.log("intentResponse", intentResponse)
                    if(intentResponse.statusCode == 400) {
                        const exitResponse =  [{
                            status: "Internal Server Error",
                            message: "Internal Server Error. Please try again later",
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
                        return exitResponse
                    }
                    //Since the API `/ai/rule-engine` gives only the `useCase` in the response so I have removed the check for other fields like categoryId, category, subtype & type
                    if (!intentResponse.useCase) {
                        //intent did not classify
                        if(sessionForIntent) {
                            await this.prisma.sessions.update({
                                data: {
                                  retriesLeft: sessionForIntent.retriesLeft - 1,
                                },
                                where: {
                                  sessionId: reqData.session_id,
                                },
                              })
                        }
                        let reframeMsg
                        //console.log("reframeMsg", reframeMsg)
                        const text = reqData.message.text.toLowerCase().split()
                        //TODO TBD Checks for the neft and rtgs keywords to provide a better reposne of the query
                        if(text.includes('neft') || text.includes('rtgs')) {
                            reframeMsg = 'Please explain you query in detail'
                        } else {
                            reframeMsg = 'Sorry I could not understand you. Please reframe you concern.'
                        }
                        return[{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": reframeMsg,
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                        }]
                    }
                    //TODO TBD The fields in the this DB update operations would be null as the API `/ai/rule-engine` do not gives the fileds cat_id, category, subtype & type 
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:2,
                            complaintCategoryId: intentResponse.cat_id,
                            complaintCategory: intentResponse.category,
                            complaintCategoryType: intentResponse.type,
                            complaintCategorySubType: intentResponse.subtype,
                            retriesLeft: 3
                        }
                    })
                    const intentPassRes = await this.states(reqData, languageDetected, 2)
                    return intentPassRes
                    break;
                case 2:
                    //TODO TBD this case needs modifications as the the APIs contract and informations available. But currently it satisfiles the flow diagram
                    //Checks for all required fields for the use-case
                    //Since the APIs to be used are still in discussion phase to the contract is not freezed completely. So the required fileds are not freezed yet
                    //However the required fileds could be the date/date-range for transanstion, UTR-NO, ACC-NO etc
                    this.logger.info('inside case 2')
                    
                    //check for the required fields: transactionstartdate, enddate and bankaccount
                    
                    const intentSession = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId:reqData.session_id
                        }
                    })
                    //If bank account number exists
                    if(intentSession?.bankAccountNumber){
                        //Check for start and enddate of transaction
                        if(!intentSession?.startDate)
                        {
                            //Return response to ask for start date
                            //Updating the state to 17
                            await this.prisma.sessions.update({
                                where:{ sessionId: reqData.session_id },
                                data:{
                                    state: 17
                                }
                            })
                            const fail_r1 = [{
                                status: "Success",
                                session_id: reqData.session_id,
                                "message": "Do you remember the date of transaction?",
                                "options": ['Yes, I remember', "No, I don't remember"],
                                "end_connection": false,
                                "prompt": "option_selection",
                                "metadata": {}
                            }]
                            return fail_r1
                        }
                        else
                        {
                            //Call for fetch transactions
                            //Update the state to 3
                            await this.prisma.sessions.update({
                                where:{sessionId:reqData.session_id},
                                data:{
                                    state:3
                                }
                            })
                            const success_r1=await this.states(reqData, languageDetected,3)
                            return success_r1
                        }
                    }
                    else
                    {
                        const failres = [{
                            status: "Bad Request",
                            "message": "No bank account details available",
                            "end_connection": false,
                        }]
                        return failres
                    }
                    break;
                case 3:
                    //TODO TBD currently it fetches the transactions for excessCHanrges use cases
                    //TODO the APIs for NEFT and RTGS needs to be integrated here as per the use case
                    //Call for Fetch transactions
                    this.logger.info('inside case 3')

                    sessionId = reqData.session_id
                    session = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId
                        }
                    })
                    console.log("session", session)
                    
                    if(session.startDate == undefined || session.endDate == undefined) {
                        return [{
                            status: "Internal Server Error",
                            message: "Transaction start date and end date are required for fetching transactions",
                            end_connection: true
                        }]
                    }
                    const transactionsReqData: TransactionsRequestDto = {
                        accountNumber: session.bankAccountNumber,
                        fromDate: session.startDate,
                        toDate: session.endDate
                    }
                    try {
                        const transactionsResponse = await this.banksService.fetchTransactions(sessionId, transactionsReqData, BankName.INDIAN_BANK)
                        if(transactionsResponse.error) {
                            await this.prisma.sessions.update({
                                where: { sessionId: reqData.session_id },
                                data: {
                                    state: 20
                                }
                            })
                            return [{
                                status: "Internal Server Error",
                                message: `I received the following error from the bank: ${transactionsResponse.message}`,
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
                        const transactions = transactionsResponse.transactions
                        // const transactions = [{
                        //     transactionDate: new Date('2024-03-13'),
                        //     transactionNarration: 'Excess wdl charges',
                        //     transactionType: 'DR',
                        //     amount: "1000"
                        // }, {
                        //     transactionDate: new Date('2024-03-14'),
                        //     transactionNarration: 'ATM AMC CHGS',
                        //     transactionType: 'DR',
                        //     amount: "1000"
                        // }]
                        if(transactions.length === 0) {
                            if(session.retriesLeft <= 0) {
                                await this.prisma.sessions.update({
                                    where:{sessionId:reqData.session_id},
                                    data:{
                                        state:99
                                    }
                                })
                                return this.states(reqData, languageDetected, 99)
                            } else {
                                await this.prisma.sessions.update({
                                    where:{ sessionId: reqData.session_id },
                                    data:{
                                        state: 5,
                                        retriesLeft: {
                                            decrement: 1
                                        }
                                    }
                                })
                                return this.states(reqData, languageDetected, 5)
                            }
                        }
                        const transactionsData = transactions.map(transaction => {
                            return {
                                sessionId: sessionId,
                                transactionTimeBank: transaction.transactionDate,
                                transactionNarration: transaction.transactionNarration,
                                transactionType: transaction.transactionType,
                                amount: transaction.amount
                            }
                        });
                        await this.prisma.transactionDetails.createMany({
                            data: transactionsData
                        })
                        const transactionOptions = transactions.map(transaction => {
                            return formatDate(transaction.transactionDate) + '|' + transaction.transactionNarration + '|' + transaction.amount
                        });
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:4
                            }
                        })
                        transactionOptions.push('None of the above')
                        const transaction_success = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Please confirm your transactions",
                            "options": transactionOptions,
                            "end_connection": false,
                            "prompt": "option_selection",
                            "metadata": {}
                        }]
                        return transaction_success
                    } catch(error) {
                        console.log('error in fetching transactions: ', error)
                        this.logger.error('error occured in state manager ', error)
                        const intentFailRes = [{
                            status: "Internal Server Error",
                            message: "Something went wrong with Bank Servers. Please try again later",
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
                case 4:
                    //ask user to confirm transaction
                    this.logger.info('inside case 4')
                    const existing_session = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId:reqData.session_id
                        }
                    })
                    if(!reqData.message.text.includes("|")) {
                        if(existing_session.retriesLeft > 0) {
                            await this.prisma.sessions.update({
                                where:{sessionId:reqData.session_id},
                                data:{
                                    retriesLeft: {
                                        decrement: 1
                                    },
                                    state: 17
                                }
                            })
                        } else {
                            await this.prisma.sessions.update({
                                where:{ sessionId: reqData.session_id },
                                data:{
                                    state: 99
                                }
                            })
                            return this.states(reqData, languageDetected, 99)
                        }
                        const state4Response = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Do you remember the date of transaction?",
                            "options": ['Yes, I remember', "No, I don't remember"],
                            "end_connection": false,
                            "prompt": "option_selection",
                            "metadata": {}
                        }]
                        return state4Response
                    } else {
                        //Update the state
                        await this.prisma.sessions.update({
                            where: {
                                sessionId:reqData.session_id
                            },
                            data: {
                                state: 7
                            }
                        })
                        return this.states(reqData, languageDetected, 7)
                    }
            }
            
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