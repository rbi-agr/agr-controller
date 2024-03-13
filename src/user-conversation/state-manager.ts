
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
                    id: sessionId,
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
                    const message = reqData.message
                    const metaData = reqData.metadata
                    const phoneNumber = String(metaData.phoneNumber)
                    const accountNumber = metaData.accountNumber
                    const dob = metaData.accountNumber
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
    
                    // const createdSession = await this.prisma.sessions.create({
                    //     data: {
                    //         user: user,
                    //         state: 0,
                    //         bankAccountNumber: accountNumber,
                    //         initialQuery: message
                    //     }
                    // })
                    msg = 'In state 0'
                    break;
                case 1:
                    //language detection
                    this.logger.info('inside case 1')
                    msg = 'Detect Langauge'
                    break;
                case 2:
                    //intent check
                    this.logger.info('inside case 2')
                    if(!this.validstate(st, 2)){
                        //Invalid state
                        return
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
                        }
                    }
                    else
                    {
                        //No bank account details found, Terminate the session
                    }
                    
                    msg = 'Check for all the fields of fetching the transactions'
                    break;
                case 3:
                    //authenticate the user
                    this.logger.info('inside case 3')
                    msg = 'User authentication'
                    break;
                case 4:
                    //ask for bank account confirmaion
                    this.logger.info('inside case 4')
                    msg = 'Bank Account confirmation'
                    break;
                case 5:
                    //check for information completness
                    this.logger.info('inside case 5')
                    msg = 'Information Completness check'
                    break;
                case 6:
                    //fetch all transactions
                    this.logger.info('inside case 6')
                    msg = 'Fetch all transactions'
                    break;
                case 7:
                    //Ask for pending info
                    this.logger.info('inside case 7')
                    msg = 'Ask for pending info'
                    break;
                case 8:
                    //Ask the user to confirm transactions
                    this.logger.info('inside case 8')
                    msg = 'Ask the user to confirm transactions'
                    break;
                case 9:
                    //Educate the user about deductions
                    this.logger.info('inside case 9')
                    msg = 'Educate the user about deductions'
                    break;
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