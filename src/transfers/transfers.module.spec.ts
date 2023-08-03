import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { TransfersModule } from './transfers.module';
import { TransferController } from './transfers.controller';
import { TransferService } from './transfers.service';
import { Transfer } from './transfers.entity';
import { BlacklistModule } from '../blacklist/blacklist.module';
import { BlackList } from '../blacklist/blacklist.entity';

const config = {
  port: 2222,
  database: {
    type: 'db_type',
    host: 'db_host',
    port: 1111,
    pass: 'db_pass',
    user: 'db_user',
    name: 'db_name',
  },
  infuraApiKey: 'db_infura_api_key',
};
const configServiceMock = { get: jest.fn((key) => config[key]) };

describe('TransfersModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TransfersModule, BlacklistModule],
    })
      .overrideProvider(getRepositoryToken(Transfer))
      .useValue({})
      .overrideProvider(getRepositoryToken(BlackList))
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TransferService)
      .useValue({})
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    const transfersModule = module.get<TransfersModule>(TransfersModule);
    expect(transfersModule).toBeDefined();
  });

  it('should provide the TransferService', () => {
    const transfersService = module.get<TransferService>(TransferService);
    expect(transfersService).toBeDefined();
  });

  it('should provide the TransferController', () => {
    const transfersController =
      module.get<TransferController>(TransferController);
    expect(transfersController).toBeDefined();
  });
});
