import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
        },
      });
      this.logger.info('This is an info log message');
      return user;
    } catch (error) {
      this.logger.error('This is an error log message', 'Optional error trace');
      throw new HttpException(error.response || 'Wallet service not running', error.response?.status || error.status || 500);
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      this.logger.info('Users retrieved successfully');
      return users;
    } catch (error) {
      this.logger.error('Error retrieving users', error);
      throw new HttpException(error.response || 'Wallet service not running', error.response?.status || error.status || 500);
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
      this.logger.info(`User with id ${id} retrieved successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Error retrieving user with id ${id}`, error);
      throw new HttpException(error.response || 'Wallet service not running', error.response?.status || error.status || 500);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      this.logger.info(`User with id ${id} updated successfully`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user with id ${id}`, error);
      throw new HttpException(error.response || 'Wallet service not running', error.response?.status || error.status || 500);
    }
  }

  async remove(id: number) {
    try {
      const deletedUser = await this.prisma.user.delete({ where: { id } }); // Use delete method to remove a user
      this.logger.info(`User with id ${id} deleted successfully`);
      return deletedUser;
    } catch (error) {
      this.logger.error(`Error deleting user with id ${id}`, error);
      throw new HttpException(error.response || 'Wallet service not running', error.response?.status || error.status || 500);
    }
  }
}
