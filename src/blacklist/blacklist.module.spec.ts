import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BlacklistModule } from './blacklist.module';
import { BlackListController } from './blacklist.controller';
import { BlackListService } from './blacklist.service';
import { BlackList } from './blacklist.entity';

describe('BlacklistModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [BlacklistModule],
    })
      .overrideProvider(getRepositoryToken(BlackList))
      .useValue({})
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    const blacklistModule = module.get<BlacklistModule>(BlacklistModule);
    expect(blacklistModule).toBeDefined();
  });

  it('should provide the BlackListService', () => {
    const blackListService = module.get<BlackListService>(BlackListService);
    expect(blackListService).toBeDefined();
  });

  it('should provide the BlackListController', () => {
    const blackListController =
      module.get<BlackListController>(BlackListController);
    expect(blackListController).toBeDefined();
  });
});
