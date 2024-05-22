import { Injectable } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logger: any;
  private lastLogDate: string;

  constructor() {
    this.logger = this.createLogger();
    this.lastLogDate = this.getCurrentDateString();
  }

  private createLogger() {
    return createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: this.getDailyLogFileName(), // Use a method to get the log file name
          level: 'error'
        })
      ],
    });
  }

  private getCurrentDateString() {
    return new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
  }

  private getDailyLogFileName() {
    const dateString = this.getCurrentDateString();
    return path.join('logs', `${dateString}.log`); // Return the log file path with the date
  }

  private updateLogFile() {
    const currentDate = this.getCurrentDateString();
    if (currentDate !== this.lastLogDate) {
      this.logger.clear();
      this.logger.add(new transports.File({
        filename: this.getDailyLogFileName(),
        level: 'error'
      }));
      this.lastLogDate = currentDate;
    }
  }

  info(message: string) {
    this.updateLogFile(); // Check if the date has changed before logging
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.updateLogFile(); // Check if the date has changed before logging
    this.logger.error(message, trace);
  }
}
