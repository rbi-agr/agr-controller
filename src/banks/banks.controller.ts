import { Controller, Get, Post, Body } from '@nestjs/common';
import { BanksService } from './banks.service';

@Controller('bank')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post('create-narration')
  createNarration(@Body() body) {
    return this.banksService.createNarrationsForIndianBank(body)
  }

  @Get('all-narrations')
  getAllNarations(){
    return this.banksService.getAllNarations()
  }
}