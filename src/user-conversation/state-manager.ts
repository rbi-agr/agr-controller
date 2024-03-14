
import { Injectable} from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";

@Injectable()
export class ChatStateManager {
    constructor(
        private readonly logger: LoggerService,
        private prisma: PrismaService
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
            const languageDetected = 'en'
            if(languageDetected !== 'en') {
                if(languageDetected === 'hi' || languageDetected === 'od'){
                    //convert the message to english
                }else {
                    //throw error stating to change the message language
                    const msg = 'Please enter you query in english, hindi or odia'
                    return msg
                }
                
            }

            //if it doesnt then create a session in db, check the language and then call states
            let state
            if (!session) {
                state = 0
            } else {
                state = session.state
            }
            const response = await this.states(reqData, languageDetected, state)

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
            switch (st) {
                case 0:
                    // user posts query, make socket connection
                    this.logger.info('inside case 0')
                    const message = reqData.message.text
                    const sessionId = reqData.session_id
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
                       const stateCreationRes = await this.states(reqData, languageDetected, 1)
                       return stateCreationRes
                    } else {
                        const stateFailRes = {
                            status: "Bad Request",
                            session_id: sessionId,
                            "message": "Please try again.",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                          }
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
                        const intentFailRes = {
                            "status": "Bad Request",
                            "message": "Maximum retries limit reached. Please try again later.",
                            "end_connection": true
                          }
                        return intentFailRes
                    } 

                    //call intent api
                    const intentResponse = {
                        category: 'category',
                        subtype: 'subtype',
                        type: 'type'
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
                                  sessionId: sessionId,
                                },
                              })
                        }
                        const intentFailRes = {
                            status: "Success",
                            session_id: sessionId,
                            "message": "Please reframe your query.",
                            "options": [],
                            "end_connection": false,
                            "prompt": "text_message",
                            "metadata":{}
                          }
                        return intentFailRes
                        
                    }
                    await this.prisma.sessions.update({
                        where:{sessionId:reqData.session_id},
                        data:{
                            state:2
                        }
                    })
                    const intentPassRes = await this.states(reqData, languageDetected, 2)
                    return intentPassRes
                    break;
                case 2:
                    //Check for all requierd fields
                    this.logger.info('inside case 2')
                    if(!this.validstate(st, 2)){
                        //Invalid state
                        return 'Invalid State'
                    }
                    //check for the required fields: transactionstartdate, enddate and bankaccount
                    
                    const session = await this.prisma.sessions.findUnique({
                        where:{
                            id:reqData.session_id
                        }
                    })
                    //If bank account number exists
                    if(session?.bankAccountNumber){
                        //Check for start and enddate of transaction
                        if(!session?.startDate)
                        {
                            //Return response to ask for start date
                            //Updating the state to 6
                            await this.prisma.sessions.update({
                                where:{id:reqData.session_id},
                                data:{
                                    state:6
                                }
                            })
                            await this.states(reqData, languageDetected,6)
                            break;
                        }
                        else
                        {
                            //Call for fetch transactions
                            //Update the state to 3
                            await this.prisma.sessions.update({
                                where:{id:reqData.session_id},
                                data:{
                                    state:3
                                }
                            })
                            await this.states(reqData, languageDetected,3)
                            break;
                        }
                    }
                    else
                    {
                        return "No bank account details available"
                    }
                    
                    msg = 'Check for all the fields of fetching the transactions'
                    break;
                case 3:
                    //Call for Fetch transactions
                    this.logger.info('inside case 3')
                    const fetchtransactionResponse = {
                        transactionDate: '12/11/24',
                        transactionType: 'excess charge',
                        transactionNarration: 'This is due to sms',
                        metadata:{}
                    }
                    //Update transaction details in db
                    if(fetchtransactionResponse){
                        await this.prisma.transactionDetails.update({
                            where:{id:reqData.session_id},
                            data:{
                                transactionTimeBank: fetchtransactionResponse.transactionDate,
                                transactionNarration: fetchtransactionResponse.transactionNarration,
                                transactionType: fetchtransactionResponse.transactionType
                            }
                        })
                        msg = 'All transaction fetched'
                        await this.states(reqData, languageDetected, 4)
                        break;
                    }
                    else
                    {
                        return "Error in fetching transactions from bank"
                    }
                    
                    
                case 4:
                    //ask user to confirm transaction
                    this.logger.info('inside case 4')
                    msg = 'User Transaction confirmation'
                    break;
                case 5:
                    //If not transaction, ask for different date range
                    this.logger.info('inside case 5')
                    msg = 'Ask for different date range'
                    //Updating the state to 9
                    await this.prisma.sessions.update({
                        where:{id:reqData.session_id},
                        data:{
                            state:9
                        }
                    })
                    return "No transactions found. Please select a different range"
                    
                case 6:
                    
                    this.logger.info('inside case 6')
                    //after fetching insert all transactions into the db, (bulk create)
                    await this.prisma.sessions.update({
                        where:{id:reqData.session_id},
                        data:{
                            state:9
                        }
                    })
                    msg = 'Ask for date of transaction'
                    //Updating the state to 9
                    return "Please enter startdate and enddate for the transaction"
                    
                case 7:
                    //Educate the user on how to prevent it
                    this.logger.info('inside case 7')
                    msg = 'Educating the user for prevention'
                    break;
                case 8:
                    //Ask the user to get transaction Id
                    this.logger.info('inside case 8')
                    //get all transactions for a session

                    //after getting all the transactions ask for a 
                    msg = 'Ask the user to get transaction Id'
                    break;
                case 9:
                    //NER BOT date check
                    this.logger.info('inside case 9')
                    msg = 'Check for dates from NERBOT'
                    const exsession = await this.prisma.sessions.findUnique({
                        where:{
                            id:reqData.session_id
                        }
                    })
                    //Data from MistralAI
                    const datesResponse = {
                        startdate: '13/03/2024',
                        enddate: '14/03/2024'
                    }
                    //Store it in db
                    if (datesResponse){
                        await this.prisma.sessions.update({
                            where:{id:reqData.session_id},
                            data:{
                                startDate:datesResponse.startdate,
                                endDate:datesResponse.enddate
                            }
                        })
                        await this.states(reqData, languageDetected,2)
                        break;
                    }
                    else
                    {
                        return "NER BOT API not sending response"
                    }
                    
                    
                case 10:
                    //ask if the user is ok with the info
                    this.logger.info('inside case 10')
                    msg = 'Ask if the user is ok with the info'
                    break;
                case 11:
                    //ask the user for a rating
                    this.logger.info('inside case 11')
                    msg = 'Ask the user for a rating'
                    break;
                case 21:
                    //Notify that the intent did not classify
                    this.logger.info('inside case 21')
                    msg = 'Notify that the intent did not classify'
                    break;
                case 22:
                    //Notify bank chatbot reference relation the authentication failed
                    this.logger.info('inside case 22')
                    msg = 'Notify bank chatbot reference relation the authentication failed'
                    break;
                case 23:
                    //Ask the user to get the transactionId and start the process again
                    this.logger.info('inside case 23')
                    msg = 'Ask the user to get the transactionId and start the process again'
                    break;
                case 24:
                    //Raise a ticket
                    this.logger.info('inside case 24')
                    msg = 'Raise a ticket'
                    break;
                case 99:
                    //End connection
                    this.logger.info('inside case 99')
                    msg = 'End connection'
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

    async IntentCheck(message: String) :Promise<any> {
        try {
            const apiUrl="URL"
            const requestBody = {
                message: message,
              };
            this.logger.info('API for Intent check')
            const response = await axios.post(apiUrl,requestBody)
            return response.data
        } catch (error) {
            this.logger.error('Error in checking this move ', error)
            return { statusCode: 400, message: 'Error in this move', error: error }
        }
    }
}