
import { Injectable} from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { getEduMsg } from "./utils/utils";
import { TransactionsRequestDto } from "src/banks/dto/transactions.dto";
import { BankName } from "@prisma/client";
import { response } from "express";
import { BanksService } from "src/banks/banks.service";
import { ComplaintRequestDto } from "src/banks/dto/complaint.dto";

@Injectable()
export class ChatStateManager {
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

            const message = reqData.message

            //detect language here
            // const languageDetectedresponse = await this.PostRequest(reqData.message.text,"https://rbih-agr.free.beeceptor.com/languagedetection")
            const languageDetectedresponse = {
                language: 'en',
                error: null
            }
            if(languageDetectedresponse.error){
                const exitResponse =  [{
                    status: "Internal Server Error",
                    message: "Error in language Detection",
                    end_connection: true
                }]
                return exitResponse
            }
            const languageDetected = languageDetectedresponse?.language
            if(languageDetected !== 'en') {
                if(languageDetected === 'hi' || languageDetected === 'od'){
                    //convert the message to english
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

            //if it doesnt then create a session in db, check the language and then call states
            let state
            if (!session) {
                state = 0
            } else {
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
            
            if(languageDetected!=="en")
            {
                //convert the message to Language detected and return
                //Translator API
                
                let translatedresponse=response?.map(async(e)=>
                {
                    let messageTranslationresp= await this.PostRequest(e?.message,"https://rbih-agr.free.beeceptor.com/languagetranslation")
                    messageTranslation = messageTranslationresp.translated
                    return {...e,message:messageTranslation}
                })
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
                        userId: '567f1f77bcf86cd799439544',
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
            return error
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
    
                    const createdSession = await this.prisma.sessions.create({
                        data: {
                            user: {
                                connect: { id: user.id } // Use the actual user ID here
                            },
                            sessionId: sessionId,
                            state: 0,
                            bankAccountNumber: accountNumber,
                            initialQuery: message,
                            retriesLeft: 3
                        }
                    })
                    if(createdSession) {
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
                    //get the intial query and check for intent which will give us category, subcategory, subtype stored in db
                    const messageForIntent = reqData.message
                    let sessionForIntent = await this.prisma.sessions.findUnique({
                        where: {
                            sessionId: reqData.session_id
                        }
                    })

                    //add a retry in the db max 3 tries
                    if(sessionForIntent && sessionForIntent.retriesLeft<=0) {
                        const intentFailRes = [{
                            "status": "Bad Request",
                            message: "Maximum retries limit reached. Please try again later.",
                            end_connection: true
                        }]
                        return intentFailRes
                    } 

                    //call intent api

                    const intentResponse = {
                        category: 'category',
                        subtype: 'subtype',
                        type: 'type',
                        error: null
                    }
                    // const intentResponse = await this.PostRequest(reqData.message.text,"https://rbih-agr.free.beeceptor.com/intentclassifier")
                    if(intentResponse.error){
                        const exitResponse =  [{
                            status: "Internal Server Error",
                            message: "Error in intent response",
                            end_connection: true
                        }]
                        return exitResponse
                    }
                    if (!intentResponse.category || !intentResponse.subtype || !intentResponse.type) {
                        //intent did not classify

                        //add a retry in the db max 3 tries
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
                        const intentFailRes = [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": "Please reframe your query.",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                          }]
                        return intentFailRes
                        
                    }
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:2,
                            complaintCategory: intentResponse.category,
                            complaintCategoryType: intentResponse.type,
                            complaintCategorySubType: intentResponse.subtype
                        }
                    })
                    const intentPassRes = await this.states(reqData, languageDetected, 2)
                    return intentPassRes
                    break;
                case 2:
                    //Check for all required fields
                    this.logger.info('inside case 2')
                    if(!this.validstate(st, 2)){
                        //Invalid state
                        const FailRes = [{
                            status: "Internal Server Error",
                            "message": "Invalid state",
                            "end_connection": false
                          }]
                        return FailRes
                    }
                    //check for the required fields: transactionstartdate, enddate and bankaccount
                    
                    const intentSsession = await this.prisma.sessions.findUnique({
                        where:{
                            sessionId:reqData.session_id
                        }
                    })
                    //If bank account number exists
                    if(intentSsession?.bankAccountNumber){
                        //Check for start and enddate of transaction
                        if(!intentSsession?.startDate)
                        {
                            //Return response to ask for start date
                            //Updating the state to 6
                            await this.prisma.sessions.update({
                                where:{sessionId:reqData.session_id},
                                data:{
                                    state:6
                                }
                            })
                            const fail_r1= await this.states(reqData, languageDetected,6)
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
                            message: "Transaction start date and end date are required for state 3",
                            end_connection: true
                        }]
                    }

                    const transactionsData: TransactionsRequestDto = {
                        accountNumber: session.bankAccountNumber,
                        fromDate: session.startDate.toISOString(),
                        toDate: session.endDate.toISOString()
                    }
                    try {
                        // const transactions = await this.banksService.fetchTransactions(sessionId, transactionsData, BankName.INDIAN_BANK)
                        const transactions = [{
                            transactionDate: '2024-03-13T00:00:00.000Z',
                            transactionNarration: 'Excess wdl charges',
                            transactionType: 'DR',
                            amount: 1000
                        }, {
                            transactionDate: '2024-03-14T00:00:00.000Z',
                            transactionNarration: 'UNCOLL CHRG DT',
                            transactionType: 'DR',
                            amount: 1000
                        }]
                        if(transactions.length === 0) {
                            await this.prisma.sessions.update({
                                where:{ sessionId: reqData.session_id },
                                data:{
                                    state: 5
                                }
                            })
                            return this.states(reqData, languageDetected, 5)
                        }
                        transactions.forEach(async (transaction) => {
                            await this.prisma.transactionDetails.create({
                                data:{
                                    sessionId: sessionId,
                                    transactionTimeBank: transaction.transactionDate,
                                    transactionNarration: transaction.transactionNarration,
                                    transactionType: transaction.transactionType,
                                    amount: transaction.amount
                                }
                            })
                        });
                        const transactionOptions = transactions.map(transaction => {
                            return transaction.transactionNarration + '-' + transaction.amount.toString()
                        });
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:4
                            }
                        })
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
                            message: "Something went wrong with Bank Servers",
                            end_connection: true
                        }]
                        return intentFailRes
                    }
                case 4:
                    //ask user to confirm transaction
                    this.logger.info('inside case 4')

                    const selectedTransaction = reqData.message.text;
                    const state4TransactionNarration = selectedTransaction.split('-')[0];
                    
                    let nextState;
                    if(state4TransactionNarration.length > 0) {
                        nextState = 7;
                    } else {
                        nextState = 8;
                    }
                    //Update the state
                    await this.prisma.sessions.update({
                        where: {
                            sessionId:reqData.session_id
                        },
                        data: {
                            state: nextState
                        }
                    })
                    return this.states(reqData, languageDetected, nextState)

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
                        "message": "No transactions found. Please select a different range",
                        "options": [],
                        "end_connection": false,
                        "prompt": "date_pick",
                        "metadata":{}
                    }]
                    return intentFailRes
                    
                case 6:
                    this.logger.info('inside case 6')
                    //after fetching insert all transactions into the db, (bulk create)
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:9
                        }
                    })
                    msg = 'Ask for date of transaction'
                    //Updating the state to 9
                    const success_r2 = [{
                        status: "Success",
                        session_id: reqData.session_id,
                        "message": "Please enter startdate and enddate for the transaction",
                        "options": [],
                        "end_connection": false,
                        "prompt": "date_pick",
                        "metadata":{}
                    }]
                    return success_r2
                    
                case 7:
                    //Educate the user on how to prevent it
                    this.logger.info('inside case 7')

                    const transaction = reqData.message.text;
                    const state7TransactionNarration = transaction.split('-')[0];

                    if(state7TransactionNarration.length > 0) {
                        //Update the state to 10
                        // await this.prisma.sessions.update({
                        //     where: {
                        //         sessionId:reqData.session_id
                        //     },
                        //     data: {
                        //         state: 10
                        //     }
                        // })
                        const educatingMessage = getEduMsg(state7TransactionNarration)

                        if(educatingMessage) {
                            const educatingRes = [{
                                status: "Success",
                                session_id: reqData.session_id,
                                message: educatingMessage,
                                options: [],
                                end_connection: false,
                                prompt: "text_message",
                                metadata: {}
                            }]
                            educatingRes.push({
                                status: "Success",
                                session_id: reqData.session_id,
                                message: "Are you satisfied with the resolution provided?",
                                options: ['Yes', 'No'],
                                end_connection: false,
                                prompt: "option_selection",
                                metadata: {}
                            })
                            //On sending successfull response update state to 10
                            await this.prisma.sessions.update({
                                where: { sessionId: reqData.session_id },
                                data: {
                                    state: 10
                                }
                            })
                            await this.prisma.transactionDetails.update({
                                where:{
                                    sessionId: reqData.session_id,
                                    transactionNarration: state7TransactionNarration
                                },
                                data:{
                                    isEducated:true
                                }
                            })
                            return educatingRes
                        } else {
                            const educatingFailRes = [{
                                status: "Internal Server Error",
                                message: "Internal Server Error",
                                end_connection: false
                            }]
                            return educatingFailRes
                        }
                    } else {
                        
                        this.logger.info("Selected transaction not found")
                        
                        const failRes = [{
                            status: "Bad Request",
                            message: "No transaction selected",
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
                        "message": "The transaction was not selected. Could you please restart the process from the beginning?",
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
                    // const datesResponse = await this.PostRequestforTransactionDates(reqData.message.text,"https://rbih-agr.free.beeceptor.com/transactiondates")
                    const datesResponse = {
                        transaction_startdate: '13/03/2024',
                        transaction_enddate: '14/03/2024',
                        error: null
                    }
                    //Store it in db
                    const startDateParts = datesResponse.transaction_startdate.split('/');
                    const endDateParts = datesResponse.transaction_enddate.split('/');
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
                    if (datesResponse){
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
                        
                    }
                    else
                    {
                        const intentFailRes = [{
                            status: "Internal Server Error",
                            "message": "No Response from Mistral.AI",
                            "end_connection": false
                          }]
                        return intentFailRes
                    }
                    
                case 10:
                    //Redirect to state 11 or 12 based on answer
                    this.logger.info('inside case 10')

                    const state10Message = reqData.message.text;
                    if(state10Message === 'Yes') {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 11
                            }
                        })
                        return this.states(reqData, languageDetected, 11)
                    } else {
                        await this.prisma.sessions.update({
                            where: { sessionId: reqData.session_id },
                            data: {
                                state: 12
                            }
                        })
                        return this.states(reqData, languageDetected, 12)
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
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                          }]
                          success_resp.push({
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": null,
                            "options": ["Yes","No"],
                            "end_connection": false,
                            "prompt": "option_selection",
                            "metadata":{}
                          })
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
                                state:13
                            }
                        })
                        const res = await this.states(reqData, languageDetected, 13)
                        return res
                    }
                    msg = 'Ask the user for other transaction'
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
                    if(session.complaintCategory == undefined 
                        || session.complaintCategoryType == undefined
                        || session.complaintCategorySubType == undefined) {
                        return [{
                            status: "Internal Server Error",
                            message: "Complaint category, type and subtype are required for state 12",
                            end_connection: true
                        }]
                    }
                    const transactionForTicket = reqData.metadata; 

                    // generate complaint details

                    // Call register complaint API
                    const complaintRequestData: ComplaintRequestDto = {
                        accountNumber: session.bankAccountNumber,
                        mobileNumber: userForTicket.phoneNumber,
                        complaintCategory: session.complaintCategory,
                        complaintCategoryType: session.complaintCategoryType,
                        complaintCategorySubtype: session.complaintCategorySubtype,
                        amount: transactionForTicket.amount,
                        transactionDate: transactionForTicket.transactionDate,
                        complaintDetails: ''
                    }
                    try {
                        // const ticketResponse = await this.banksService.registerComplaint(sessionId, complaintRequestData, BankName.INDIAN_BANK)
                        const ticketResponse = {
                            ticketNumber: '123456'
                        }
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
                                state: 99
                            }
                        })
                        return [{
                            status: "Success",
                            session_id: reqData.session_id,
                            message: "Ticket raised successfully with ticket number " + ticketResponse.ticketNumber,
                            options: [],
                            end_connection: true,
                            prompt: "text_message",
                            metadata: {}
                        }]
                    } catch (error) {
                        this.logger.error('Error in raising ticket: ', error)
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
                        prompt: "text_message"
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
                    //Updating the transaction iseducated value to true
                    // await this.prisma.transactionDetails.update({
                    //     where:{
                    //         sessionId: reqData.session_id,
                    //         transactionId: metaData.transactionId
                    //     },
                    //     data:{
                    //         isEducated:true
                    //     }
                    // })
                    //Send the user to state 7 for educating him
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
                        const failRes = [{
                            status: "Bad Request",
                            message: "No transaction selected",
                            end_connection: false
                        }]
                        return failRes
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
                        end_connection: false,
                        prompt: "text_message"
                    }]
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:99,
                            ratings: parseInt(reqData.message.text)
                        }
                    })
                    const resArray = []
                    resArray.push(storeRatingRes)

                    const closeResponse = await this.states(reqData, languageDetected, 99)
                    resArray.push(closeResponse)
                    return resArray
                case 16:
                    //Waiting for user response to educate him about other trasnactions
                    this.logger.info('inside case 16')
                    const userresponse = reqData.message.text
                    if(userresponse==="Yes")
                    {
                        //Pass the remaining transaction list data
                        const uneducated_transaction = await this.prisma.transactionDetails.findMany({
                            where:{
                                sessionId:reqData.session_id,
                                isEducated:false
                            }
                        })
                        
                        const transactionOptions = uneducated_transaction.map(transaction => {
                            return transaction.transactionNarration + '-' + transaction.amount.toString()
                        });
                        
                        const success_r4= [{
                            status: "Success",
                            session_id: reqData.session_id,
                            "message": null,
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
                    else{
                        await this.prisma.sessions.update({
                            where:{sessionId:reqData.session_id},
                            data:{
                                state:13
                            }
                        })
                        const res = await this.states(reqData, languageDetected, 13)
                        return res
                    }

                    msg = 'User response for educating him'
                    break;
                
                
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
            this.logger.error('error occured in state manager ', error)
            return error
        }
    }

    async validstate(prevst: any, nextst: any) {
        try {
            this.logger.info('check valid state')
            if (prevst && nextst) {
                const flowArray = [
                    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ]
                const valid = flowArray[Number(prevst)][Number(nextst)]
                if (valid) {
                    return valid
                }
                return { statusCode: 404, message: 'States not in the flowmatrix. Please provide valid state' }

            }
            return { statusCode: 404, message: 'States not provided. Please provide valid state' }
        } catch (error) {
            this.logger.error('Error in checking this move ', error)
            return { statusCode: 400, message: 'Error in this move', error: error }
        }
    }

    async PostRequest(message: String,apiUrl: any) :Promise<any> {
        try {
            const requestBody = {
                message: message,
              };
            this.logger.info('API for Post Request')
            const response = await axios.post(apiUrl,requestBody)
            return response.data
        } catch (error) {
            this.logger.error('Error in calling this API', error)
            return { statusCode: 400, message: 'Error in calling this API', error: error }
        }
    }

    async PostRequestforTransactionDates(message: String,apiUrl: any) :Promise<any> {
        try {
            const requestBody = {
                userprompt: message,
                task:"fetch me the start and end date in format(mm-dd-yyyy example) in json format like:{'transaction_startdate': 'ISODate''transaction_enddate': 'ISODate'}"
              };
            this.logger.info('API for Post Request for TransactionDates')
            const response = await axios.post(apiUrl,requestBody)
            return response.data
        } catch (error) {
            this.logger.error('Error in checking this move ', error)
            return { statusCode: 400, message: 'Error in this move', error: error }
        }
    }
    // close socket connection code
    // case to rate a session and close socket connections
    //make sure to return response in the same language as of users query
}