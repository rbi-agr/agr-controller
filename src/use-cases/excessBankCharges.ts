
import { Injectable} from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import { formatDate, getComplaintDetails, getCorrespondingNarration, getEduMsg, PostRequest, PostRequestforTransactionDates, PostRequestforTranslation, translatedResponse, validstate } from "../utils/utils";
import { TransactionsRequestDto } from "src/banks/dto/transactions.dto";
import { BankName } from "@prisma/client";
import { BanksService } from "src/banks/banks.service";
import { ComplaintRequestDto } from "src/banks/dto/complaint.dto";
import * as constants from "../utils/constants"
import { getTemplateResponse } from "./templatization";
import { getPrismaErrorStatusAndMessage } from "src/utils/handleErrors";
import * as Sentry from '@sentry/node'

@Injectable()
export class ExcessBankCharges {
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
            
            const detectLang = reqData.metadata?.language !== 'en' && (!session || !statesExcludedForLangDetect.includes(session.state) || (session.state == 4 && !message.includes("|")))

            let languageDetected;
            
            if(detectLang) {
                const languageDetectedresponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/language-detect`)
                // const languageDetectedresponse = {
                //     language: 'en',
                //     error: null
                // }
                //Update the language detected in Adya
                
                if(languageDetectedresponse.error){
                    Sentry.captureException("Excess Bank Charges Error: Preprocess Language Detection Error")
                    this.logger.error("Excess Bank Charges Error: Preprocess Language Detection Error:",languageDetectedresponse.error)
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
                            Sentry.captureException("Excess Bank Charges Error: Preprocess Language Translation Error")
                            this.logger.error("Excess Bank Charges Error: Preprocess Language Translation Error:",translatedmessage.error)
                            return[{
                                status: "Internal Server Error",
                                "message": "I am having trouble translating your query. Please make sure the query is correctly typed and try again",
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
                if(session && session?.languageByAdya && session?.languageByAdya!==languageDetected)
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
                if(session && session?.languageByAdya && session?.languageByAdya!==languageDetected)
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
                
                let translatedresponse = await translatedResponse(response, languageDetected, reqData.session_id, this.prisma)
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
            Sentry.captureException("Excess Bank Charges: Preprocess Error Occured")
            this.logger.error('Excess Bank Charges: Preprocess Error Occured:', error)
            console.log('error in state manager: ', error.message)
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

    async states(reqData, languageDetected, st: any) {
        try {
            this.logger.info('inside state manager')
            let msg = ''
            let session;
            let sessionId: string;
            switch (st) {
                case 0:
                    // user posts query, make socket connection
                    this.logger.info('inside case 0')
                    const message = reqData.message.text
                    sessionId = reqData.session_id
                    
                    //detect language here
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
                    const intentResponse = await PostRequest(reqData.message.text,`${process.env.BASEURL}/ai/intent-classifier`)
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
                    if (!intentResponse.cat_id || !intentResponse.category || !intentResponse.subtype || !intentResponse.type) {
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
                        if(reqData.message.text.toLowerCase().includes('bank charges')) {
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
                    //Check for all required fields
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
                    //Call for Fetch transactions
                    this.logger.info('inside case 3')

                    sessionId = reqData.session_id
                    session = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId
                        }
                    })
                    
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
                            Sentry.captureException("Excess Bank Charges Error: Fetch Transactions Error: Error Response from Bank API")
                            //this.logger.error("Excess Bank Charges Error: Fetch Transactions Error: Error Response from Bank API:", transactionsResponse.error )
                            await this.prisma.sessions.update({
                                where: { sessionId: reqData.session_id },
                                data: {
                                    state: 20
                                }
                            })
                            const failMessage3 = transactionsResponse.message ?? "I could not fetch transactions from the bank. Please ensure you have selected the valid bank account number and try again."
                            return [{
                                status: "Internal Server Error",
                                message: failMessage3,
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

                        let transactionmsg
                        let endConnection = false
                        transactions.map(transaction => {
                            if(!transaction.transactionDate) {
                                transactionmsg = "Transaction Date is empty"
                                endConnection = true
                            } else if(!transaction.transactionNarration) {
                                transactionmsg = "Transaction narration is empty"
                                endConnection = true
                            } else if(!transaction.transactionType) {
                                transactionmsg = "Transaction type is empty"
                                endConnection = true
                            } else if(transaction.transactionNarration.includes('*')) {
                                transactionmsg = "Transaction narration contains special charaters"
                                endConnection = true
                            }
                        })
                        if(endConnection) {
                            await this.endTransaciton(transactionmsg, sessionId)
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
                        const errorStatus3 = getPrismaErrorStatusAndMessage(error)
                        Sentry.captureException("Excess Bank Charges: Fetch Transaction Error")
                        console.log('Excess Bank Charges: Fetch Transaction Error:', errorStatus3.errorMessage)
                        this.logger.error('error occured in state manager ', errorStatus3.errorMessage)
                        const intentFailRes = [{
                            status: "Internal Server Error",
                            message: "I could not fetch transactions from the bank. Please try again later.",
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
                case 5:
                    //If not transaction, ask for different date range
                    this.logger.info('inside case 5')
                    msg = 'Ask for different date range'
                    //Updating the state to 9
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:9
                        }
                    })
                    const intentFailRes = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        "message": "No transactions were found. Please select a different range",
                        "options": [],
                        "end_connection": false,
                        "prompt": "date_range",
                        "metadata":{}
                    }]
                    return intentFailRes
                    
                case 6:
                    this.logger.info('inside case 6')
                    //Updating the state to 9
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:9
                        }
                    })
                    msg = 'Ask for date of transaction'
                    const success_r2 = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        "message": "Please enter the date of transaction",
                        "options": [],
                        "end_connection": false,
                        "prompt": "date_picker",
                        "metadata":{}
                    }]
                    return success_r2
                    
                case 7:
                    //Educate the user on how to prevent it
                    this.logger.info('inside case 7')

                    const transaction = reqData.message.text;
                    const state7TransactionNarration = transaction.split('|')[1];
                    const state7TransactionAmount = transaction.split('|')[2];

                    let transactionmsg
                    let endConnection = false
                        if(!state7TransactionNarration) {
                            transactionmsg = "Transaction narration is empty"
                            endConnection = true
                        } else if(state7TransactionNarration.includes('*')) {
                            transactionmsg = "Transaction narration contains special charaters"
                            endConnection = true
                        }
                    if(endConnection) {
                        return await this.endTransaciton(transactionmsg, reqData.session_id)
                    }

                    if(state7TransactionNarration && state7TransactionNarration.length > 0) {

                        // set selected transaction
                        const tsession = await this.prisma.sessions.findUnique({
                            where: {
                                sessionId: reqData.session_id
                            }
                        })
                        const transactionDetails = await this.prisma.transactionDetails.findFirst({
                            where: {
                                sessionId: reqData.session_id,
                                // id: tsession.id,
                                transactionNarration: state7TransactionNarration
                            }
                        })
                        await this.prisma.sessions.update({
                            where: {
                                sessionId: reqData.session_id
                            },
                            data: {
                                selectedTransactionId: transactionDetails?.id
                            }
                        })

                        // generate educating message
                        const bankNarrations = await this.prisma.bankNarrations.findMany();

                        let correspondingNarration;
                        const transactionNarrationLower = state7TransactionNarration.toLowerCase()

                        bankNarrations.forEach((bankNarration) => {
                            const bankNarrationLower = bankNarration.narration.toLowerCase()
                            if(transactionNarrationLower.includes(bankNarrationLower)) {
                                correspondingNarration = bankNarration
                            }
                        })
                        if(!correspondingNarration) {
                            const narrationsList = bankNarrations.map(bankNarration => bankNarration.narration)
                            const narrationResponse = await getCorrespondingNarration(state7TransactionNarration, narrationsList)
                            if(narrationResponse.error){
                                Sentry.captureException("Excess Bank Charges Error:Fetching Narration Error")
                                this.logger.error('Excess Bank Charges Error:Fetching Narration Error:', narrationResponse.error)
                                const exitResponse = [{
                                    status: "Internal Server Error",
                                    message: "Sorry, something went wrong while finding the cause for this transaction. Please try again later",
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
                            try {
                                correspondingNarration = JSON.parse(JSON.stringify(narrationResponse.message.content));
                                console.log("correspondingNarration", correspondingNarration)
                            } catch (error) {
                                this.logger.error('Excess Bank Charges Error: Parsing Narration Error:', error)
                                correspondingNarration = "No match found";
                            }
                            if(correspondingNarration === "No match found" || !narrationsList.includes(correspondingNarration)) {
                                const educatingFailRes = [{
                                    status: "Internal Server Error",
                                    message: "Sorry, We could not find the cause for this transaction. Please try later",
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
                                return educatingFailRes
                            }
                        }
                        // get bank account type
                        const state7Session = await this.prisma.sessions.findUnique({
                            where: { sessionId: reqData.session_id }
                        });
                        const accountNumber = state7Session.bankAccountNumber;
                        const accountType = accountNumber.substring(0, 2);
                        
                        // const educatingMessageResponse = await getTemplateResponse(correspondingNarration, accountType, parseInt(state7TransactionAmount.split('.')[0]), languageDetected, this.prisma);

                        const educatingMessageResponse = await getEduMsg(correspondingNarration, accountType, parseInt(state7TransactionAmount.split('.')[0]));

                        console.log("Educatingresponse........................",educatingMessageResponse)
                        if(educatingMessageResponse.error){
                            Sentry.captureException("Excess Bank Charges Error: Fetching Educating Message Error")
                            this.logger.error('Excess Bank Charges Error: Fetching Educating Message Error:', educatingMessageResponse.error)
                            const exitResponse = [{
                                status: "Internal Server Error",
                                message: "Sorry, something went wrong while finding the cause for this transaction. Please try again later",
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
                        let educatingRes = [];
                        if(educatingMessageResponse.message?.content) {
                            const educatingMessage = JSON.parse(educatingMessageResponse.message.content);
                                                            
                            // const educatingMessage = correspondingNarration.natureOfCharge
                            const edumsg = `Reason:-\n ${educatingMessage.response.reason}`
                            console.log(edumsg)
                            let moreinfo = educatingMessage.response.prevention_methods
                            let additionalInfoString = 'Additional information:-\n'
                            for(let m=0; m<moreinfo.length; m++) {
                                additionalInfoString += '- '+moreinfo[m] + '\n'
                            }
                            educatingRes = [{
                                status: "Success",
                                session_id: reqData.session_id,
                                message: edumsg,
                                options: [],
                                end_connection: false,
                                prompt: "text_message",
                                metadata: {}
                            }]
                            educatingRes.push({
                                status: "Success",
                                session_id: reqData.session_id,
                                message: additionalInfoString,
                                options: [],
                                end_connection: false,
                                prompt: "text_message",
                                metadata: {}
                            })
                        } else {
                            // template response
                            for(let msg of educatingMessageResponse) {
                                educatingRes.push({
                                    status: "Success",
                                    session_id: reqData.session_id,
                                    message: msg,
                                    options: [],
                                    end_connection: false,
                                    prompt: "text_message",
                                    metadata: {}
                                })
                            }
                        }
                        educatingRes.push({
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "Are you satisfied with the resolution provided?",
                            options: ['Yes, I am satisfied', 'No, I am not satisfied'],
                            end_connection: false,
                            prompt: "option_selection",
                            metadata: {}
                        })
                        
                        //On sending successfull response update state to 10
                        let usession = await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 10
                            }
                        })
                        await this.prisma.transactionDetails.update({
                            where:{
                                id: transactionDetails.id
                            },
                            data:{
                                isEducated:true
                            }
                        })
                        return educatingRes
                    } else {
                        
                        this.logger.info("Selected transaction not found")
                        
                        const failRes = [{
                            status: "Bad Request",
                            message: "No transaction selected. Please select a transaction to proceed",
                            end_connection: false
                        }]
                        return failRes
                    }
                case 8:
                    //Ask the user to get transaction Id
                    this.logger.info('inside case 8')
                    //get all transactions for a session

                    //after getting all the transactions ask for a 
                    msg = 'Ask the user to get transaction Id'
                    //Update the state to 99
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:99
                        }
                    })
                    const success_r3 = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        "message": "No transaction selected. Could you please restart the process from the beginning?",
                        "options": [],
                        "end_connection": true,
                        "prompt": "text_message",
                        "metadata":{}
                    }]
                    return success_r3
                    break;
                case 9:
                    //NER BOT date check
                    this.logger.info('inside case 9')
                    msg = 'Check for dates from NERBOT'
                    const exsession = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId:reqData.session_id
                        }
                    })
                    //Data from MistralAI
                    const userMessage = reqData.message.text
                    // const contextMessageForMistral = `user query: ${userMessage} task- give me the start and end date from the user query, just the result in json format, in the following format.  response={ startDate: <startDate>, endDate: <endDate>}, pls do not add any description or explanation just give me the json response`
                    // const mistralResponse = await this.callMistralAI(contextMessageForMistral)
                    // console.log('mistral response ', mistralResponse)
                    // const dateData = mistralResponse.data.message.content
                    // console.log('dateData ', dateData)
                    // const datesResponse = {
                    //     transaction_startdate: '13/03/2024',
                    //     transaction_enddate: '14/03/2024',
                    //     error: null
                    // }
                    //Store it in db
                    const userMessageJson = JSON.parse(userMessage)
                    let startDateParts;
                    let endDateParts;

                    if(userMessageJson.startDate.includes('/') && userMessageJson.endDate.includes('/')) {
                        startDateParts = userMessageJson.startDate.split('/');
                        endDateParts = userMessageJson.endDate.split('/');
                    } else if(userMessageJson.startDate.includes('-') && userMessageJson.endDate.includes('-')) {
                        startDateParts = userMessageJson.startDate.split('-');
                        endDateParts = userMessageJson.endDate.split('-');
                    } else {
                        let day = userMessageJson.startDate.substring(0, 2);
                        let month = userMessageJson.startDate.substring(2, 4);
                        let year = userMessageJson.startDate.substring(4, 8);
                        startDateParts = [day, month, year];
                        day = userMessageJson.endDate.substring(0, 2);
                        month = userMessageJson.endDate.substring(2, 4);
                        year = userMessageJson.endDate.substring(4, 8);
                        endDateParts = [day, month, year];
                    }
                    const startDate = new Date(`${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`);
                    const endDate = new Date(`${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`);

                    //Store it in db
                    // if(datesResponse.error){
                    //     const exitResponse =  [{
                    //         status: "Internal Server Error",
                    //         message: "Error in Mistral AI response",
                    //         end_connection: true
                    //     }]
                    //     return exitResponse
                    // }
                    // const startDate = new Date(datesResponse.transaction_startdate);
                    // const endDate = new Date(datesResponse.transaction_enddate);

                    // Convert to ISO 8601 format
                    const isoStartDate = startDate.toISOString();
                    const isoEndDate = endDate.toISOString();

                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            startDate:isoStartDate,
                            endDate:isoEndDate
                        }
                    })
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:2
                        }
                    })
                    const success_resp= this.states(reqData, languageDetected,2)
                    return success_resp    
                case 10:
                    //Redirect to state 11 or 12 based on answer
                    this.logger.info('inside case 10')

                    const state10Message = reqData.message.text;
                    if(state10Message && state10Message.toLowerCase().includes('yes')) {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 11
                            }
                        })
                        return this.states(reqData, languageDetected, 11)
                    } else if((state10Message && state10Message.toLowerCase().includes('no'))) {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 12
                            }
                        })
                        return this.states(reqData, languageDetected, 12)
                    }
                    else
                    {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 20
                            }
                        })
                        return [{
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "I'm sorry, something went wrong on my end. Please select Yes to end the conversation.",
                            options: ['Yes, end the conversation'],
                            end_connection: false,
                            prompt: "option_selection",
                            metadata: {}
                        }]
                    }
                case 11:
                    //If transactions are fetched more than 1, ask user about the other transaction too
                    
                    this.logger.info('inside case 11')
                    const uneducatedTransactioncount = await this.prisma.transactionDetails.count({
                        where:{
                            sessionId: reqData.session_id,
                            isEducated:false
                        }
                    })
                    if(uneducatedTransactioncount > 0)
                    {
                        const success_resp = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Do you want to know about the other transactions too?",
                            "options": ["Yes, I want to know", "No, I don't want to know"],
                            "end_connection": false,
                            "prompt": "option_selection",
                            "metadata":{}
                        }]
                        //Add another response for choices
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:16
                            }
                        })
                        //Asking user to respond yes/no for other transactions
                        return success_resp
                    }
                    else
                    {
                        //If the user is educated for all transactions
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:15
                            }
                        })
                        const res = await this.states(reqData, languageDetected, 15)
                        return res
                    }
                    break;
                case 12:
                    //Raise a ticket
                    this.logger.info('inside case 12')
                    sessionId = reqData.session_id
                    session = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId:sessionId
                        }
                    });
                    
                    const userForTicket = await this.prisma.users.findUnique({
                        where:{
                            id:session.userId
                        }
                    })
                    if(session.complaintCategoryId == undefined 
                        || session.complaintCategory == undefined 
                        || session.complaintCategoryType == undefined
                        || session.complaintCategorySubType == undefined) {
                        return [{
                            status: "Internal Server Error",
                            message: "Complaint category, categoryId, type and subtype are required for state 12",
                            end_connection: true
                        }]
                    }
                    const transactionForTicket = await this.prisma.transactionDetails.findUnique({
                        where:{
                            id: session.selectedTransactionId
                        }
                    })
                    // get corresponding bank narration
                    const bankNarrations = await this.prisma.bankNarrations.findMany();

                    let correspondingBankNarration;
                    const transactionNarrationLower = transactionForTicket.transactionNarration.toLowerCase()

                    bankNarrations.forEach((bankNarration) => {
                        const bankNarrationLower = bankNarration.narration.toLowerCase()
                        if(transactionNarrationLower.includes(bankNarrationLower)) {
                            correspondingBankNarration = bankNarration
                        }
                    
                    })
                    // generate complaint details
                    const complaint = {
                        complaintCategory: session.complaintCategory,
                        complaintCategoryType: session.complaintCategoryType,
                        complaintCategorySubtype: session.complaintCategorySubType,
                        narration: transactionForTicket.transactionNarration,
                        natureOfCharge: correspondingBankNarration?.natureOfCharge,
                        amount: transactionForTicket.amount
                    }
                    const complaintDetailsres = await getComplaintDetails(complaint)
                    
                    const complaintDetails = JSON.parse(JSON.stringify(complaintDetailsres.message.content))
                    console.log(complaintDetails)
                    // Call register complaint API
                    const complaintRequestData: ComplaintRequestDto = {
                        accountNumber: session.bankAccountNumber,
                        mobileNumber: userForTicket.phoneNumber,
                        complaintCategoryId: session.complaintCategoryId,
                        complaintCategory: session.complaintCategory,
                        complaintCategoryType: session.complaintCategoryType,
                        complaintCategorySubtype: session.complaintCategorySubType,
                        amount: transactionForTicket.amount.toString(),
                        transactionDate: transactionForTicket.transactionTimeBank,
                        complaintDetails: complaintDetails
                    }
                    try {
                        const ticketResponse = await this.banksService.registerComplaint(sessionId, complaintRequestData, BankName.INDIAN_BANK)
                        if(ticketResponse.error) {
                            Sentry.captureException("Excess Bank Charges: Register Complaint Error")
                            //this.logger.error("Excess Bank Charges: Register Complaint Error:", ticketResponse.error)
                            const failMessage12 = ticketResponse.message ?? "I could not raise a ticket with the bank. Please try again later."
                            return [{
                                status: "Internal Server Error",
                                message: failMessage12,
                                end_connection: true
                            }]
                        }
                        // const ticketResponse = {
                        // ticketNumber: '123456'
                        // }
                        await this.prisma.sessions.update({
                            where: {
                                sessionId: reqData.session_id
                            },
                            data: {
                                ticketId: ticketResponse.ticketNumber,
                                ticketRaised: true,
                                ticketRaisedTime: new Date()
                            }
                        })
                        //Update the state to 99
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 20
                            }
                        })

                        const ticketRes = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            message: `Your issue has been registered in the CGRS system with this ticket ID: ${ticketResponse.ticketNumber}. You can track the status of your issue on this link: ${constants.CGRSLink}`,
                            options: [],
                            end_connection: false,
                            prompt: "text_message",
                            metadata: {}
                        }]

                        ticketRes.push({
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "Please select Yes to end the conversation.",
                            options: ['Yes, end the conversation'],
                            end_connection: false,
                            prompt: "option_selection",
                            metadata: {}
                        })

                        return ticketRes
                    } catch (error) {
                        Sentry.captureException("Excess Bank Charges: Register Complaint Error")
                        this.logger.error('Excess Bank Charges: Register Complaint Error:', error)
                        return [{
                            status: "Internal Server Error",
                            message: "Error in raising ticket",
                            end_connection: true
                        }]
                    }
                case 13:
                    //Ask the user for a rating
                    this.logger.info('inside case 13')
                    const askRatingRes = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        message: "Please give a rating on a scale of 1 to 5",
                        options: [],
                        end_connection: false,
                        prompt: "rating"
                    }]
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:15
                        }
                    })
                    return askRatingRes
                    break;
                case 14:
                    //Select the transaction from the list
                    this.logger.info('inside case 14')
                    
                    if(reqData.message.text)
                    {
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:7
                            }
                        })
                        const educresp = await this.states(reqData,languageDetected,7)
                        
                        return educresp
                        
                    }
                    else{
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 20
                            }
                        })
                        return [{
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "No transactions selected. Please select Yes to end the conversation.",
                            options: ['Yes, end the conversation'],
                            end_connection: false,
                            prompt: "option_selection",
                            metadata: {}
                        }]
                    }
                    msg = 'Select the transaction from the list'
                    break;
                case 15:
                    //take the rating, store it and close the connection
                    this.logger.info('inside case 15')
                    const storeRatingRes = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        message: "Thanks for your feedback. Happy to serve you.",
                        options: [],
                        end_connection: true,
                        prompt: "text_message"
                    }]
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:99,
                            ratings: parseInt(reqData.message.text)
                        }
                    })
                    return storeRatingRes
                case 16:
                    //Waiting for user response to educate him about other trasnactions
                    this.logger.info('inside case 16')
                    const userresponse = reqData.message.text
                    if(userresponse && userresponse.toLowerCase().includes("yes"))
                    {
                        //Pass the remaining transaction list data
                        const uneducated_transaction = await this.prisma.transactionDetails.findMany({
                            where:{
                                sessionId:reqData.session_id,
                                isEducated:false
                            }
                        })
                        
                        const transactionOptions = uneducated_transaction.map(transaction => {
                            return formatDate(transaction.transactionTimeBank) + '|' + transaction.transactionNarration + '|' + transaction.amount
                        });
                        
                        const success_r4= [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": 'Please select from the following transactions',
                            "options": transactionOptions,
                            "end_connection": false,
                            "prompt": "option_selection",
                            "metadata":{}
                        }]
                        
                        //Update the state to 14
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:14
                            }
                        })
                        return success_r4
                    }
                    else if(userresponse && userresponse.toLowerCase().includes("no")){
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:15
                            }
                        })
                        const res = await this.states(reqData, languageDetected, 15)
                        return res
                    }
                    else 
                    {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 20
                            }
                        })
                        return [{
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "No transactions selected. Please select Yes to end the conversation.",
                            options: ['Yes, end the conversation'],
                            end_connection: false,
                            prompt: "option_selection",
                            metadata: {}
                        }]
                    }
                    break;
                case 17:
                    //Redirect to state 6 or 18 based on answer
                    this.logger.info('inside case 17')

                    const state17Message = reqData.message.text;
                    let state17NextState;
                    if(state17Message && state17Message.toLowerCase().includes('yes')) {
                        state17NextState = 6;
                    } else if (state17Message && state17Message.toLowerCase().includes('no')) {
                        state17NextState = 18;
                    }
                    else {
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
                            "message":"I apologize, but I didn't quite understand that. Could you please rephrase your query?",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                        }]
                    }
                    await this.prisma.sessions.update({
                        where: {
                            sessionId:reqData.session_id
                        },
                        data: {
                            state: state17NextState
                        }
                    })
                    return this.states(reqData, languageDetected, state17NextState)
                case 18:
                    this.logger.info('inside case 18')
                    //Updating the state to 9
                    await this.prisma.sessions.update({
                        where: { sessionId: reqData.session_id },
                        data: {
                            state: 9
                        }
                    })
                    const state18SuccessResponse = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        "message": "Please enter the start date and end date for the transaction",
                        "options": [],
                        "end_connection": false,
                        "prompt": "date_range",
                        "metadata": {}
                    }]
                    return state18SuccessResponse
                case 19:
                    this.logger.info('inside case 19')
                    const state19Message = reqData.message.text;
                    if(state19Message && state19Message.toLowerCase().includes('yes')) {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 0
                            }
                        })
                        return [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Please enter your query",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                          }]
                        
                    } else if((state19Message && state19Message.toLowerCase().includes('no'))) {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 15
                            }
                        })
                        return this.states(reqData, languageDetected, 15)
                    }
                    else
                    {
                        return [{
                                status: "Bad Request",
                                message: "Invalid Query. Please try again later",
                                end_connection: false
                        }]
                    }
                    break;
                case 20:
                    this.logger.info('inside case 20')
                    const userresponseToEnd = reqData.message.text
                    if(userresponseToEnd && userresponseToEnd.toLowerCase().includes("yes")){
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 99
                            }
                        })
                    }
                    return [{
                        status: "Success",
                        session_id: reqData.session_id,
                        "message": "Thank You",
                        "options": [],
                        "end_connection": true,
                        "prompt": "text_message",
                        "metadata":{}
                      }]
                case 99:
                    //End connection
                    this.logger.info('inside case 99')
                    const closeConnectionRes = [{
                        status: "Success",
                        session_id: sessionId,
                        message: "You have reached you maximum retries limit. Please try again after some time. Thank You!",
                        options: [],
                        end_connection: true,
                        prompt: "text_message"
                    }]
                    return closeConnectionRes
                    break;
            }
            return msg
        } catch (error) {
            Sentry.captureException("Excess Bank Charges: Error in State Manager")
            this.logger.error('Excess Bank Charges: Error in State Manager:', error)
            await this.prisma.sessions.update({
                where: { sessionId: reqData.session_id },
                data: { state: 20 }
            })
            return [{
                "status": "Internal Server Error",
                message: "I'm sorry, something went wrong on my end",
                end_connection: false
            },{
                status: "Success",
                session_id: reqData.session_id,
                message: "Please refresh to restart the conversation or select Yes to end the conversation.",
                options: ['Yes, end the conversation'],
                end_connection: false,
                prompt: "option_selection",
                metadata: {}
            }]
        }
    }

    async endTransaciton(msg, sessionId){
        await this.prisma.sessions.update({
            where: { sessionId: sessionId },
            data: { state: 20 }
        })
        return [{
            status: "Success",
            session_id: sessionId,
            "message": `${msg}`,
            "options": [],
            "end_connection": true,
            "prompt": "text_message",
            "metadata": {}
        }] 
    }

}