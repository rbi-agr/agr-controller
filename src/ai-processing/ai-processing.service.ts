import { Injectable } from '@nestjs/common';
import { CreateAiProcessingDto } from './dto/create-ai-processing.dto';
import { UpdateAiProcessingDto } from './dto/update-ai-processing.dto';
import { PrismaService } from "src/prisma/prisma.service";
import { LoggerService } from "../logger/logger.service"
import * as Sentry from '@sentry/node'

@Injectable()
export class AiProcessingService {
  constructor(
    private readonly logger : LoggerService,
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
      Sentry.captureException("AI Service Error: Switching Language Error")
      this.logger.error("AI Service Error: Switching Language Error",error)
      return { status: "Internal Server Error",
      message: "Language could not be updated updated"}
    }
  }
}
