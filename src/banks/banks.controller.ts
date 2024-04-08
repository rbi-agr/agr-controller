import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { BanksService } from './banks.service';
import { LoggerService } from 'src/logger/logger.service';

@Controller('banks')
export class BankController {
    constructor(
        private readonly logger: LoggerService,
        private banksService: BanksService
    ) { }

    @Post('token')
    async generateToken(
        @Body() body: { bankId: string, tokenSecret: string },
        @Res() res
    ) {
        try {
            this.logger.info("Inside generate token")
            const { bankId, tokenSecret } = body;
            const token = await this.banksService.generateToken(bankId, tokenSecret)
            this.logger.info("Token generated successfully")
            res.status(HttpStatus.OK).json({
                message: "Token generated successfully",
                data: {
                    token
                }
            })
        } catch (error) {
            this.logger.error("Error occured while generating token ", error)
            return error
        }
    }
}
