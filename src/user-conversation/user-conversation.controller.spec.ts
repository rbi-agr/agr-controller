import { Test, TestingModule } from '@nestjs/testing';
import { UserConversationController } from './user-conversation.controller';

describe('UserConversationController', () => {
  let controller: UserConversationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserConversationController],
    }).compile();

    controller = module.get<UserConversationController>(UserConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
