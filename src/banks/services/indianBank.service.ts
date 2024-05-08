import { Injectable } from '@nestjs/common';
import { BankName, InteractionType } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction, TransactionsRequestDto, TransactionsResponseDto } from '../dto/transactions.dto';
import { ComplaintRequestDto, ComplaintResponseDto } from '../dto/complaint.dto';
import { LoanAccountBalanceRequestDto, LoanAccountBalanceResponseDto } from '../dto/loanbalance.dto';
import * as constants from '../utils/bankConstants';
import * as https from 'https'

@Injectable()
export class IndianBankService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async fetchTransactions(sessionId: string, transactionsDto: TransactionsRequestDto): Promise<TransactionsResponseDto> {

    const bankUrl = constants.indianBankUrl;
    console.log("Indian bank url: ", bankUrl)
    if (!bankUrl) {
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
    console.log("accountNumber: ", accountNumber)
    if(!accountNumber) {
      throw new Error('Invalid account number');
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
        const errDesc = response.data.ErrorResponse.additionalinfo?.excepText
        return {
          error: true,
          message: errDesc,
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
      console.log("Error while fetching transactions: ", error.response?.data ?? error.message)
      throw new Error(error.response?.data ?? error.message);
    }
  }

  async registerComplaint(sessionId: string, complaintDto: ComplaintRequestDto): Promise<ComplaintResponseDto> {

    const bankUrl = constants.indianBankUrl;
    if (!bankUrl) {
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
        return {
          error: true,
          message: errDesc,
        }
      }
      const ticketNumber = response.data.CGRSRegistration_Response?.Body?.Payload?.data?.Ticket_Number;
      console.log("ticketNumber: ", ticketNumber)
      if(!ticketNumber) {
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
      console.log("Error while registering complaint: ", error.response?.data ?? error.message)
      throw new Error(error.response?.data ?? error.message);
    }
  }


  async getLoanAccountBalance(sessionId: string, accountDto: LoanAccountBalanceRequestDto): Promise<LoanAccountBalanceResponseDto> {

    const bankUrl = constants.indianBankUrl;
    if (!bankUrl) {
      throw new Error('Bank URL not found');
    }

    const accountNumber = parseInt(accountDto.accountNumber.split('-')[1]);
    if(!accountNumber) {
      throw new Error('Invalid account number');
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
        headers: headers
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
        const errDesc = response.data.ErrorResponse.additionalinfo?.excepText
        return {
          error: true,
          message: errDesc
        }
      }
      const mainResponse = response.data.LoanAcctEnq_Response
      const accResponse = mainResponse?.Body?.Payload;

      if(!accResponse) {
        return {
          error: true,
          message: 'Invalid account number'
        }
      }
      return {
        error: false,
        totalOutstanding: accResponse.Bal,
        principalOutstanding: accResponse.Npb,
        interestPaid: accResponse.C_Y_Ytd_Int
      }

    } catch (error) {
      console.log("Error while getting loan account balance: ", error.response?.data ?? error.message)
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
      throw new Error(error.response?.data ?? error.message);
    }
  }

  async getAllNarrations() {
    try {
      return await this.prisma.bankNarrations.findMany()
    } catch (error){
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