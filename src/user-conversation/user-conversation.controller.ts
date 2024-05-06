import { Body, Controller, Post } from '@nestjs/common';
import { addRatingOverall } from 'src/utils/utils';

@Controller('chat')
export class UserConversationController {

    @Post('rating')
    addRating(@Body() body: {rating: number, sessionid: string} ){
        const { rating, sessionid } = body;
        return addRatingOverall(rating,sessionid)
    }
}
