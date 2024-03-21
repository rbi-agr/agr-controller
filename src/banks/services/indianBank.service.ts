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

    const requestPayload = {
      Account_Number: transactionsDto.accountNumber,
      From_Date: transactionsDto.fromDate,
      To_Date: transactionsDto.toDate,
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
        return {
          transactionDate: transaction.Valid_Date,
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
    const endpoint = `/ticket`;

    const requestPayload = {
      Date_Time: new Date(),
      Acc_No: complaintDto.accountNumber,
      Mob_No: complaintDto.mobileNumber,
      Comp_Cat: complaintDto.complaintCategory,
      Comp_Cat_Type: complaintDto.complaintCategoryType,
      Comp_Cat_Sub_Type: complaintDto.complaintCategorySubtype,
      Amt: complaintDto.amount,
      Tran_Date: complaintDto.transactionDate,
      Comp_Details: complaintDto.complaintDetails,
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
