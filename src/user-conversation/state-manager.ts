import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class ChatStateManager {
    constructor(
        private readonly logger: LoggerService
    ){}

    async states(st: any) {
        try {
            this.logger.info('inside state manager')
            let msg = ''
            switch (st) {
              case 0:
                // user posts query, make socket connection
                this.logger.info('inside case 0')
                msg = 'In state 0'
                break;
              case 1:
                //check for intent
                this.logger.info('inside case 1')
                msg = 'Intent Checking'
                break;
              case 2:
                //intent classifies
                this.logger.info('inside case 2')
                msg = 'Intent classifies'
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
            if(prevst && nextst){
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
                  if (valid){
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
}