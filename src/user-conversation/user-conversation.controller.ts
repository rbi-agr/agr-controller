import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { addRatingOverall } from 'src/utils/utils';

@Controller('chat')
export class UserConversationController {
    constructor( private prisma: PrismaService ) { }

    @Post('rating')
    addRating(@Body() body: {rating: number, sessionid: string} ){
        const { rating, sessionid } = body;
        return addRatingOverall(rating,sessionid, this.prisma)
    }
}
