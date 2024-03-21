import { Body, Controller, Post } from '@nestjs/common';
import { ChatStateManager } from './state-manager';

@Controller('user')
export class UserConversationController {
    constructor(private readonly chatService: ChatStateManager){}

    @Post('rating')
    addRating(@Body() body: {rating: number, sessionid: string} ){
        const { rating, sessionid } = body;
        return this.chatService.addRatingOverall(rating,sessionid)
    }
}
