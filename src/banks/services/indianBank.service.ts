import { Injectable } from '@nestjs/common';
import { BankName, InteractionType } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction, TransactionsRequestDto, TransactionsResponseDto } from '../dto/transactions.dto';
import { ComplaintRequestDto, ComplaintResponseDto } from '../dto/complaint.dto';
import { LoanAccountBalanceRequestDto, LoanAccountBalanceResponseDto } from '../dto/loanbalance.dto';
import { LoggerService } from "src/logger/logger.service";
import * as constants from '../utils/bankConstants';
import { ChequeBookStatusRequestDto, ChequeBookStatusResponseDto } from '../dto/chequeBook.dto';
import * as https from 'https'
import * as Sentry from '@sentry/node'

@Injectable()
export class IndianBankService {
  constructor(
    private readonly logger : LoggerService,
    private prisma: PrismaService,
  ) {}

  async fetchTransactions(sessionId: string, transactionsDto: TransactionsRequestDto): Promise<TransactionsResponseDto> {

    const bankUrl = constants.indianBankUrl;
    console.log("Indian bank url: ", bankUrl)
    if (!bankUrl) {
      Sentry.captureException("Fetch Transactions Error: Missing Bank URL")
      this.logger.info("Fetch Transactions Error: Missing Bank URL")
      throw new Error('Bank URL not found');
    }
    console.log("transactionsDto: ", transactionsDto)
    // convert the date to the format DDMMYYYY
    const fromDate = transactionsDto.fromDate.toISOString().split('T')[0].split('-').reverse().join('');
    const toDate = transactionsDto.toDate.toISOString().split('T')[0].split('-').reverse().join('');
    console.log("fromDate: ", fromDate)
    console.log("toDate: ", toDate)

    const accountType = transactionsDto.accountNumber.substring(0, 2);
    console.log("accountType: ", accountType)

    let endpoint: string;
    if(accountType == 'LN') {
      endpoint = `/statement/v1/eq-ltxn-chrg`;
    } else {
      endpoint = `/statement/v1/eq-dtxn-chrg`;
    }
    const accountNumber = parseInt(transactionsDto.accountNumber.split('-')[1]);
    if(!accountNumber) {
      Sentry.captureException("Fetch Transactions Error: Invalid Account Number")
      this.logger.info("Fetch Transactions Error: Invalid Account Number")
      return {
        error: true,
        message: 'The account number you have selected is invalid. Please try again with a valid account number',
        transactions: []
      }
    }

    const requestPayload = {
      Account_Number: accountNumber,
      From_Date: fromDate,
      To_Date: toDate,
    }
    console.log("requestPayload: ", requestPayload)
    
    const apiInteractionId = await this.getInteractionId();
    console.log("apiInteractionId: ", apiInteractionId)


    const bankInteraction = await this.prisma.bankInteractions.create({
      data: {
        sessionId: sessionId,
        bankName: BankName.INDIAN_BANK,
        interactionType: InteractionType.TRANSACTIONS,
      }
    });
    const headers = this.constructRequestHeaders(apiInteractionId)
    console.log("headers: ", headers)

    try {
      console.log("bankUrl + endpoint: ", bankUrl + endpoint)
      const response = await axios.post(bankUrl + endpoint, requestPayload, {
        headers: headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      })
      const responseHeaders = response.headers;
      await this.prisma.bankInteractions.update({
        where: {
          id: bankInteraction.id
        },
        data: {
          metadata: {
            'x-api-interaction-id': apiInteractionId,
            'ib-gwy-id': responseHeaders['ib-gwy-id'],
          }
        }
      });
      console.log("response.data: ", response.data)
      if(response.data.ErrorResponse) {
        Sentry.captureException("Fetch Transactions Error: Error Response from Bank API")
        this.logger.error("Fetch Transactions Error: Error Response from Bank API:",response.data.ErrorResponse)
        const errDesc = response.data.ErrorResponse.additionalinfo?.excepText

        let errorMessage = undefined;
        if(errDesc.includes('INVALID ACCOUNT NUMBER')) {
          errorMessage = 'The account number you have selected is invalid. Please try again with a valid account number'
        }
        
        return {
          error: true,
          message: errorMessage,
          transactions: []
        }
      }
      const mainResponse = response.data.LoanMainStatement_Response ?? response.data.MainStatement_Response
      console.log("mainResponse: ", mainResponse)
      const transactions = mainResponse?.Body?.Payload?.Collection ?? [];
      console.log("transactions: ", transactions)

      const formattedTransactions: Transaction[] = transactions.map(transaction => {
        const transactionDate = formatResponseDate(transaction.Valid_Date)
        return {
          transactionDate: transactionDate,
          transactionType: transaction.Transaction_Type,
          amount: transaction.Amount,
          transactionNarration: transaction.Narration,
        }
      });
      return {
        error: false,
        transactions: formattedTransactions
      }

    } catch (error) {
      Sentry.captureException("Fetch Transactions Error")
      this.logger.error("Fetch Transactions Error:",error)
      throw new Error(error);
    }
  }

  async registerComplaint(sessionId: string, complaintDto: ComplaintRequestDto): Promise<ComplaintResponseDto> {

    const bankUrl = constants.indianBankUrl;
    if (!bankUrl) {
      Sentry.captureException("Register Complaint Error: Missing Bank URL")
      this.logger.info("Register Complaint Error: Missing Bank URL")
      throw new Error('Bank URL not found');
    }
    console.log("Indian bank url: ", bankUrl)

    const apiInteractionId = await this.getInteractionId();
    console.log("apiInteractionId: ", apiInteractionId)

    const bankInteraction = await this.prisma.bankInteractions.create({
      data: {
        sessionId: sessionId,
        bankName: BankName.INDIAN_BANK,
        interactionType: InteractionType.COMPLAINT_REGISTRATION,
      }
    });

    const endpoint = `/chatbot/v1/ct-complaint-cgrs`;

    // get current date and time in format DD/MM/YYYY
    const currentDateTime = getCurrentDateTime();

    // get transaction date in format DD-MM-YYYY
    const transactionDateInFormat = complaintDto.transactionDate.toISOString().split('T')[0].split('-').reverse().join('-');

    // convert the account number to integer
    const accountNumber = complaintDto.accountNumber.split('-')[1];

    const requestPayload = {
      CGRSRegistration_Request: {
        Body: {
          Payload: {
            data: {
              Request_Date_and_Time: currentDateTime,
              Customer_Account_Number: accountNumber,
              Customer_Mobile_Number: complaintDto.mobileNumber,
              Customer_Cat_ID: `${complaintDto.complaintCategoryId}`,
              Complaint_category: complaintDto.complaintCategory,
              Complaint_category_type: complaintDto.complaintCategoryType,
              Complaint_category_subtype: complaintDto.complaintCategorySubtype,
              Amount: complaintDto.amount,
              txn_Date: transactionDateInFormat,
              Complaint_detail: complaintDto.complaintDetails,
            }
          }
        }
      }
    }
    console.log("requestPayload: ", requestPayload.CGRSRegistration_Request.Body.Payload.data)
    
    const headers = this.constructRequestHeaders(apiInteractionId); 

    try {
      console.log("bankUrl + endpoint: ", bankUrl + endpoint)
      const response = await axios.post(bankUrl + endpoint, requestPayload, {
        headers: headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      const responseHeaders = response.headers;

      await this.prisma.bankInteractions.update({
        where: {
          id: bankInteraction.id
        },
        data: {
          metadata: {
            'x-api-interaction-id': apiInteractionId,
            'ib-gwy-id': responseHeaders['ib-gwy-id'],
          }
        }
      });
      console.log("response.data: ", response.data)
      if(response.data.ErrorResponse) {
        const errDesc = response.data.ErrorResponse.additionalinfo?.excepText
        this.logger.error("Register Complaint Error: Error Response from Bank API:",errDesc)
        Sentry.captureException(`Register Complaint Error: ${errDesc}`)
        return {
          error: true,
        }
      }
      const responseData = response.data.CGRSRegistration_Response?.Body?.Payload?.data;
      const errorStatusDetail = responseData?.status_detail;
      if(errorStatusDetail.includes('Invalid Complaint Category')) {
        this.logger.error("Register Complaint Error: Error Response from Bank API:",responseData)
        Sentry.captureException(`Register Complaint Error: ${responseData}`)
        return {
          error: true,
          message: 'I could not raise a ticket since your complaint category is invalid. Please try again later'
        }
      }
      const ticketNumber = responseData?.Ticket_Number;
      console.log("ticketNumber: ", ticketNumber)
      if(!ticketNumber) {
        this.logger.error("Register Complaint Error: Error Response from Bank API:",responseData)
        Sentry.captureException(`Register Complaint Error: ${responseData}`)
        return {
          error: true,
          message: 'Something went wrong while registering complaint',
        }
      }
      return {
          error: false,
          ticketNumber: ticketNumber
      }
    } catch (error) {
      Sentry.captureException("Register Complaint Error")
      this.logger.error("Register Complaint Error:",error)
      throw new Error(error.response?.data ?? error.message);
    }
  }


  async getLoanAccountBalance(sessionId: string, accountDto: LoanAccountBalanceRequestDto): Promise<LoanAccountBalanceResponseDto> {

    const bankUrl = constants.indianBankUrl;
    if (!bankUrl) {
      Sentry.captureException("Fetch Loan Account Balance Error: Missing Bank URL")
      this.logger.info("Fetch Loan Account Balance Error: Missing Bank URL")
      throw new Error('Bank URL not found');
    }

    const accountNumber = parseInt(accountDto.accountNumber.split('-')[1]);
    if(!accountNumber) {
      Sentry.captureException("Fetch Loan Account Balance Error: Invalid Account Number")
      this.logger.info("Fetch Loan Account Balance Error: Invalid Account Number")
      return {
        error: true,
        message: 'The account number you have selected is invalid. Please try again with a valid account number'
      }
    }

    const requestPayload = {
      Account_Number: accountNumber
    }

    const apiInteractionId = await this.getInteractionId();

    const bankInteraction = await this.prisma.bankInteractions.create({
      data: {
        sessionId: sessionId,
        bankName: BankName.INDIAN_BANK,
        interactionType: InteractionType.LOAN_ACCOUNT_BALANCE,
      }
    });
    const headers = this.constructRequestHeaders(apiInteractionId)

    const endpoint = `/enquiry/v1/eq-ln-dtl`;

    try {
      const response = await axios.post(bankUrl + endpoint, requestPayload, {
        headers: headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      })
      const responseHeaders = response.headers;
      await this.prisma.bankInteractions.update({
        where: {
          id: bankInteraction.id
        },
        data: {
          metadata: {
            'x-api-interaction-id': apiInteractionId,
            'ib-gwy-id': responseHeaders['ib-gwy-id'],
          }
        }
      });
      if(response.data.ErrorResponse) {
        Sentry.captureException("Fetch Loan Account Balance Error: Error Response from Bank API")
        this.logger.error("Fetch Loan Account Balance Error: Error Response from Bank API:",response.data.ErrorResponse)
        const errDesc = response.data.ErrorResponse.additionalinfo?.excepText
        
        let errorMessage = undefined;
        if(errDesc.includes('INVALID CHECK DIGIT')) {
          errorMessage = 'The account number you have selected is invalid. Please try again with a valid account number with correct number of digits'
        }
        return {
          error: true,
          message: errorMessage
        }
      }
      const mainResponse = response.data.LoanAcctEnq_Response
      console.log("mainResponse: ", mainResponse)
      const accResponse = mainResponse?.Body?.Payload;
      console.log("Payload: ", accResponse)

      if(!accResponse) {
        Sentry.captureException("Fetch Loan Account Balance Error: Invalid Account Number")
        this.logger.info("Fetch Loan Account Balance Error: Invalid Account Number")
        return {
          error: true,
          message: 'The account number you have selected is invalid. Please try again with a valid account number'
        }
      }
      return {
        error: false,
        totalOutstanding: accResponse.Bal,
        principalOutstanding: accResponse.Npb,
        interestPaid: accResponse.C_Y_Ytd_Int
      }

    } catch (error) {
      Sentry.captureException("Fetch Loan Account Balance Error")
      this.logger.error("Fetch Loan Account Balance Error:",error)
      throw new Error(error);
    }
  }


  async chequeBookStatus(sessionId: string, chequebookDto: ChequeBookStatusRequestDto): Promise<ChequeBookStatusResponseDto> {

    const bankUrl = constants.indianBankUrl;
    if (!bankUrl) {
      throw new Error('Bank URL not found');
    }

    const accountNumber = chequebookDto.accountNumber.split('-')[1];
    if(!accountNumber) {
      return {
        error: true,
        message: 'The account number you have selected is invalid. Please try again with a valid account number'
      }
    }

    const requestPayload = {
      ChequeBookTracking_Request: {
        Body: {
          Payload: {
            AccountNumber: accountNumber
          }
        }
      }
    }

    const apiInteractionId = await this.getInteractionId();

    const bankInteraction = await this.prisma.bankInteractions.create({
      data: {
        sessionId: sessionId,
        bankName: BankName.INDIAN_BANK,
        interactionType: InteractionType.CHEQUE_BOOK_STATUS,
      }
    });
    const headers = this.constructRequestHeaders(apiInteractionId)

    // TODO: Update endpoint when exposed by the bank
    const endpoint = `/cheque-service/v1/eq-chkbk-sts`;

    try {
      const response = await axios.post(bankUrl + endpoint, requestPayload, {
        headers: headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      })
      const responseHeaders = response.headers;
      await this.prisma.bankInteractions.update({
        where: {
          id: bankInteraction.id
        },
        data: {
          metadata: {
            'x-api-interaction-id': apiInteractionId,
            'ib-gwy-id': responseHeaders['ib-gwy-id'],
          }
        }
      });
      if(response.data.ErrorResponse) {
        this.logger.error("Cheque Book Status Error: Error Response from Bank API:",response.data.ErrorResponse.additionalinfo)
        Sentry.captureException(`Cheque Book Status Error: Error Response from Bank API ${response.data.ErrorResponse.additionalinfo}`)
        const errDesc = response.data.ErrorResponse.additionalinfo?.excepMetaData
        let errorMessage = undefined;
        if(errDesc.includes("Mandatory Field 'AccountNumber' is missing")) {
          errorMessage = 'You have not selected an account number. Please try again with a valid account number'
        }
        return {
          error: true,
          message: errorMessage
        }
      }
      const mainResponse = response.data.ChequeBookTracking_Response.Body.Payload;
      if(mainResponse.Status = 'SUCCESS') {
        const trackingList = mainResponse?.TrackingList
        if(trackingList.length) {
          const trackingDetail = trackingList[0];
          const name = trackingDetail.Name;
          const trackingId = trackingDetail.TrackingID;
          const bookingDate = trackingDetail.BookingDate;
          return {
            error: false,
            name: name,
            trackingId: trackingId,
            bookingDate: bookingDate
          }
        } else {
          this.logger.info(`Cheque book tracking list is empty. Response: ${mainResponse}`)
          return {
            error: true,
            message: "No cheque book status found. Please make sure you have applied for a cheque book"
          } 
        }
      }
      return {
        error: true,
        message: 'No cheque book status found. Please make sure you have applied for a cheque book'
      }
    } catch (error) {
      console.log("Error while getting cheque book balance: ", error.response?.data ?? error.message)
      throw new Error(error.response?.data ?? error.message);
    }
  }

  private async getInteractionId() {
    const numberOfInteractions = await this.prisma.bankInteractions.count({
      where: {
        bankName: BankName.INDIAN_BANK,
      }
    });
    // convert to 9 digit string
    const interactionNumber = (numberOfInteractions % 1000000000 + 1).toString().padStart(9, '0');
    const apiInteractionId = constants.indianBankChannelValue + Date.now().toString() + interactionNumber;
    return apiInteractionId;
  }

  private constructRequestHeaders(apiInteractionId: string) {
    
    const headers = {
      'X-IB-Client-Id': constants.indianBankClientId,
      'X-IB-Client-Secret': constants.indianBankClientSecret,
      'Channel': constants.indianBankChannel,
      'X-Client-Certificate': constants.indianBankClientCertificate,
      'X-API-Interaction-ID': apiInteractionId,
      'Override-Flag': '0',
      'Recovery-Flag': '0',
      'HealthCheck': 'false',
      'HealthType': 'GWY',
      'Branch-Number': constants.indianBankBranchNumber,
      'Teller-Number': constants.indianBankTellerNumber,
      'Terminal-Number': constants.indianBankTerminalNumber,
    };
    // check if these values are present
    for (const key in headers) {
      if(key == 'Override-Flag' || key == 'Recovery-Flag' || key == 'HealthCheck')
        continue;
      if (!headers[key]) {
        Sentry.captureException(`Header ${key} not found`)
        this.logger.info(`Header ${key} not found`)
        throw new Error(`Header ${key} not found`);
      }
    }
    return headers;
  }

  async createNarrations(body) {
    try {
      return await this.prisma.bankNarrations.create({
        data: {
          narration: body.narration,     
          natureOfCharge: body.natureOfCharge,
          details: body.details       
        }
      })
    } catch (error){
      Sentry.captureException("Create New Narrations Error")
      this.logger.error("Create New Narrations Error:",error)
      throw new Error(error.response?.data ?? error.message);
    }
  }

  async getAllNarrations() {
    try {
      return await this.prisma.bankNarrations.findMany()
    } catch (error){
      Sentry.captureException("Fetching All Narrations Error")
      this.logger.error("Fetching All Narrations Error:",error)
      throw new Error(error.response?.data ?? error.message);
    }
  }
}

function getCurrentDateTime() {
  const now = new Date();
  
  // Extracting date components
  const date = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero based
  const year = now.getFullYear();
  
  // Constructing the formatted date and time string
  const dateTimeString = `${date}/${month}/${year}`;
  
  return dateTimeString;
}

function formatResponseDate(dateString: string): Date {
  
  const day = dateString.substring(0, 2);
  const month = dateString.substring(2, 4);
  const year = dateString.substring(4, 8);

  return new Date(`${year}-${month}-${day}`);
}