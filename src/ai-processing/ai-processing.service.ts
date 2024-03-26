import { Injectable } from '@nestjs/common';
import { CreateAiProcessingDto } from './dto/create-ai-processing.dto';
import { UpdateAiProcessingDto } from './dto/update-ai-processing.dto';
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AiProcessingService {
  constructor(
    private prisma: PrismaService
) { }
  create(createAiProcessingDto: CreateAiProcessingDto) {
    return 'This action adds a new aiProcessing';
  }

  findAll() {
    return `This action returns all aiProcessing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aiProcessing`;
  }

  update(id: number, updateAiProcessingDto: UpdateAiProcessingDto) {
    return `This action updates a #${id} aiProcessing`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiProcessing`;
  }

  async switchLanguage(language: string, session_id) {
    try {
      if (language !=='en' && language !== 'hi' && language !== 'or'){
        return {
          status: "Internal Server Error",
          message: "Language must be English, Hindi or Ordia"
        }
      }
      
      if(session_id) {
        const session = await this.prisma.sessions.update({
          where: { sessionId: session_id },
          data: {
            languageByAdya: language
          }
        })

        const userId = session.userId
        await this.prisma.users.update({
          where: { id: userId },
          data: {
            languageDetected: language
          }
        })
        return {
          status: "Success",
          message: "Language updated"
        }
      }
      return {
          status: "Internal Server Error",
          message: "Session not found"
        }
    } catch(error) {
      console.log('error in swtiching language ', error)
      return { status: "Internal Server Error",
      message: "Language could not be updated updated"}
    }
  }
}
