import { Injectable } from '@nestjs/common';
import { BankName, InteractionType } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionsRequestDto, TransactionsResponseDto } from '../dto/transactions.dto';
import { ComplaintRequestDto, ComplaintResponseDto } from '../dto/complaint.dto';
import * as constants from '../utils/bankConstants';

@Injectable()
export class IndianBankService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async fetchTransactions(sessionId: string, transactionsDto: TransactionsRequestDto): Promise<TransactionsResponseDto[]> {

    const bankUrl = process.env.INDIAN_BANK_URL;
    if (!bankUrl) {
      throw new Error('Bank URL not found');
    }
    // TODO: Update endpoint when exposed by the bank
    const endpoint = `/transactions`;

    // convert the date to the format DDMMYYYY
    const fromDate = transactionsDto.fromDate.toISOString().split('T')[0].split('-').reverse().join('');
    const toDate = transactionsDto.toDate.toISOString().split('T')[0].split('-').reverse().join('');

    const requestPayload = {
      Account_Number: transactionsDto.accountNumber,
      From_Date: fromDate,
      To_Date: toDate,
    }
    
    const apiInteractionId = await this.getInteractionId();

    const bankInteraction = await this.prisma.bankInteractions.create({
      data: {
        sessionId: sessionId,
        bankName: BankName.INDIAN_BANK,
        interactionType: InteractionType.TRANSACTIONS,
      }
    });
    const headers = this.constructRequestHeaders(apiInteractionId)

    try {
      const response = await axios.post(bankUrl + endpoint, requestPayload, {
        headers: headers
      })
      const transactions = response.data.TXN_CHGS_RESPONSE.body.payload.collection;

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
      const formattedTransactions: TransactionsResponseDto[] = transactions.map(transaction => {
        const transactionDate = formatResponseDate(transaction.Valid_Date)
        return {
          transactionDate: transactionDate,
          transactionType: transaction.Transaction_Type,
          amount: transaction.Amount,
          transactionNarration: transaction.Narration,
        }
      });
      return formattedTransactions

    } catch (error) {
            throw new Error(error.response?.data ?? error.message);
    }
  }

  async registerComplaint(sessionId: string, complaintDto: ComplaintRequestDto): Promise<ComplaintResponseDto> {

    const bankUrl = constants.indianBankUrl;
    if (!bankUrl) {
      throw new Error('Bank URL not found');
    }

    const apiInteractionId = await this.getInteractionId();

    const bankInteraction = await this.prisma.bankInteractions.create({
      data: {
        sessionId: sessionId,
        bankName: BankName.INDIAN_BANK,
        interactionType: InteractionType.COMPLAINT_REGISTRATION,
      }
    });

    // TODO: Update endpoint when exposed by the bank
    const endpoint = `/uat-indian-bankapi/enterprise/rbih/v1/add-complaint-cgrs`;

    // get current date and time in format DD-MM-YYYY HH:MM:SS
    const currentDateTime = getCurrentDateTime();

    // get transaction date in format DD-MM-YYYY
    const transactionDateInFormat = complaintDto.transactionDate.toISOString().split('T')[0].split('-').reverse().join('-');

    const requestPayload = {
      Request_Date_and_Time: currentDateTime,
      Customer_Account_Number: complaintDto.accountNumber,
      Customer_Mobile_Number: complaintDto.mobileNumber,
      Customer_Cat_ID: complaintDto.complaintCategoryId,
      Complaint_category: complaintDto.complaintCategory,
      Complaint_category_type: complaintDto.complaintCategoryType,
      Complaint_category_subtype: complaintDto.complaintCategorySubtype,
      Amount: complaintDto.amount,
      txn_Date: transactionDateInFormat,
      Complaint_detail: complaintDto.complaintDetails,
    }
    const headers = this.constructRequestHeaders(apiInteractionId);

    try {
      const response = await axios.post(bankUrl + endpoint, requestPayload, {
        headers: headers
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
      const ticketNumber = response.data.body.payload.Ticket_No;
      return {
          ticketNumber: ticketNumber
        }
    } catch (error) {
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
    const apiInteractionId = process.env.INDIAN_BANK_CHANNEL_VALUE + Date.now().toString() + interactionNumber;
    return apiInteractionId;
  }

  private constructRequestHeaders(apiInteractionId: string) {
    
    const headers = {
      'X-IB-Client-Id': constants.indianBankClientId,
      'X-IB-Client-Secret': constants.indianBankClientSecret,
      'Channel': constants.indianBankChannelName,
      'X-Client-Certificate': constants.indianBankClientCertificate,
      'X-API-Interaction-ID': apiInteractionId,
      'HealthCheck': 'FALSE',
      // 'HealthType': ,
      'Branch-Number': constants.indianBankBranchNumber,
      'Teller-Number': constants.indianBankTellerNumber,
      'Terminal-Number': constants.indianBankTerminalNumber,
    };
    // check if these values are present
    for (const key in headers) {
      if (!headers[key]) {
        throw new Error(`Header ${key} not found`);
      }
    }
    return headers;
  }
}

function getCurrentDateTime() {
  const now = new Date();
  
  // Extracting date components
  const date = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero based
  const year = now.getFullYear();
  
  // Extracting time components
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Constructing the formatted date and time string
  const dateTimeString = `${date}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  
  return dateTimeString;
}

function formatResponseDate(dateString: string): string {
  if (dateString.length !== 8) {
      return dateString; // Invalid input length
  }
  
  const day = dateString.substring(0, 2);
  const month = dateString.substring(2, 4);
  const year = dateString.substring(4, 8);

  return `${year}-${month}-${day}`;
}