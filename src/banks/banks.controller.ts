import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Req, Res } from '@nestjs/common';
import { BanksService } from './banks.service';
import { LoggerService } from 'src/logger/logger.service';
import { BankName } from '@prisma/client';
import { getPrismaErrorStatusAndMessage } from 'src/utils/utils';
import { AddBankDto } from './dto/addBank.dto';

@Controller('banks')
export class BankController {
    constructor(
        private readonly logger: LoggerService,
        private banksService: BanksService
    ) { }

    @Post('add-bank')
    async addBank(
        @Req() req,
        @Body() addBankDto: AddBankDto,
        @Res() res
    ) {
        try {
            this.logger.info("Inside add bank")

            const token = await this.banksService.addBank(addBankDto, req.headers.authorization)
            this.logger.info("Bank added successfully")
            res.status(HttpStatus.OK).json({
                message: "Bank added successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while adding bank ", error)
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(error);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || "Failed to add bank.",
            });
        }
    }

    @Get('token/:bankId')
    async getBankToken(
        @Req() req,
        @Param("bankId", ParseUUIDPipe) bankId: string,
        @Res() res
    ) {
        try {
            this.logger.info("Inside get bank token")

            const token = await this.banksService.getBankToken(bankId, req.headers.authorization)
            this.logger.info("Token fetched successfully")
            res.status(HttpStatus.OK).json({
                message: "Token fetched successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while fetching token ", error)
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(error);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || "Failed to fetch token.",
            });
        }
    }

    @Patch('token/:bankId')
    async updateToken(
        @Req() req,
        @Param("bankId", ParseUUIDPipe) bankId: string,
        @Res() res
    ) {
        try {
            this.logger.info("Inside update token")

            const token = await this.banksService.updateToken(bankId, req.headers.authorization)
            this.logger.info("Token updated successfully")
            res.status(HttpStatus.OK).json({
                message: "Token updated successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while updating token ", error)
            const { errorMessage, statusCode } = getPrismaErrorStatusAndMessage(error);
            res.status(statusCode).json({
                statusCode,
                message: errorMessage || "Failed to update token.",
            });
        }
    }

    @Post('create-narration')
    createNarration(@Body() body) {
        return this.banksService.createNarrationsForIndianBank(body)
    }

    @Get('all-narrations')
    getAllNarations(){
        return this.banksService.getAllNarations()
    }
}
