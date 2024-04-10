import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { BanksService } from './banks.service';
import { LoggerService } from 'src/logger/logger.service';
import { BankName } from '@prisma/client';

@Controller('banks')
export class BankController {
    constructor(
        private readonly logger: LoggerService,
        private banksService: BanksService
    ) { }

    @Post('add-bank')
    async addBank(
        @Req() req,
        @Body() body: { bankId: string, bankName: BankName},
        @Res() res
    ) {
        try {
            this.logger.info("Inside add bank")
            const { bankId, bankName } = body;

            // get secret from authorization header having basic auth username as secret
            const tokenSecret = req.headers.authorization.split(' ')[1]

            const token = await this.banksService.addBank(bankId, bankName, tokenSecret)
            this.logger.info("Bank added successfully")
            res.status(HttpStatus.OK).json({
                message: "Bank added successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while adding bank ", error)
            return error
        }
    }

    @Get('token/:bankId')
    async getBankToken(
        @Req() req,
        @Param("bankId") bankId: string,
        @Res() res
    ) {
        try {
            this.logger.info("Inside get bank token")
            // get secret from authorization header having basic auth username as secret
            const secret = req.headers.authorization.split(' ')[1]

            const token = await this.banksService.getBankToken(bankId, secret)
            this.logger.info("Token fetched successfully")
            res.status(HttpStatus.OK).json({
                message: "Token fetched successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while fetching token ", error)
            return error
        }
    }

    @Patch('token')
    async updateToken(
        @Req() req,
        @Body() body: { bankId: string, bankName: string },
        @Res() res
    ) {
        try {
            this.logger.info("Inside update token")
            const { bankId } = body;

            // get secret from authorization header having basic auth username as secret
            const tokenSecret = req.headers.authorization.split(' ')[1]

            const token = await this.banksService.updateToken(bankId, tokenSecret)
            this.logger.info("Token updated successfully")
            res.status(HttpStatus.OK).json({
                message: "Token updated successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while updating token ", error)
            return error
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
