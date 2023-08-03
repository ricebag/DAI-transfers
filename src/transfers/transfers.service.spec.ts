import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TransferService } from './transfers.service';
import { Transfer } from './transfers.entity';
import {
  Contract,
  on as importedOn,
  Web3,
  WebSocketProvider,
} from './__mocks__/web3';
import { default as abi } from './abi.json';
import { ConfigService } from '@nestjs/config';

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

describe('TransferService', () => {
  let transferService: TransferService;
  let transfersRepositoryMock: any;

  const execute = jest.fn();
  const orIgnore = jest.fn(() => ({ execute }));
  const values = jest.fn(() => ({ orIgnore }));
  const into = jest.fn(() => ({ values }));
  const insert = jest.fn(() => ({ into }));

  const getRawMany = jest.fn();
  const andWhere = jest.fn(() => ({ getRawMany }));
  const where = jest.fn(() => ({ andWhere }));
  const take = jest.fn(() => ({ where, getRawMany }));
  const orderBy = jest.fn(() => ({ take }));
  const groupBy = jest.fn(() => ({ orderBy }));
  const select = jest.fn(() => ({ groupBy }));

  const createQueryBuilder = jest.fn(() => ({ insert, select }));
  const findOneBy = jest.fn();

  const mockEvent = {
    returnValues: {
      src: 'senderWalletAddress1',
      dst: 'recieverWalletAddress1',
      wad: 1000,
    },
    blockNumber: 1,
  };
  const events = [
    mockEvent,
    {
      returnValues: {
        src: 'senderWalletAddress2',
        dst: 'recieverWalletAddress2',
        wad: 2000,
      },
      blockNumber: 2,
    },
  ];
  const getPastEvents = jest.fn(() => events);
  const on = jest
    .fn()
    .mockImplementation((event, callback) => callback(mockEvent));
  const transferMock = jest.fn(() => ({ on }));

  const contract = {
    getPastEvents,
    events: { Transfer: transferMock },
  };

  const mockWeb3 = {
    utils: {
      fromWei: jest.fn().mockReturnValue('1000'),
    },
    eth: {
      getBlock: jest.fn().mockResolvedValue({
        timestamp: 1626623970,
      }),
      Contract: jest.fn(() => contract),
      getBlockNumber: jest.fn(() => 15000),
    },
    providers: {
      WebsocketProvider: jest.fn(() => 'mWeb3Provider'),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: getRepositoryToken(Transfer),
          useValue: {
            createQueryBuilder,
            findOneBy,
          },
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    transferService = module.get<TransferService>(TransferService);
    transfersRepositoryMock = module.get(getRepositoryToken(Transfer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SaveTransfer', () => {
    it('should save transfer successfully', async () => {
      const event = {
        returnValues: {
          src: 'senderAddress1',
          dst: 'receiverAddress1',
          wad: 1000,
        },
        blockNumber: 1000,
      };

      await transferService.saveTransfer(mockWeb3, event);

      expect(mockWeb3.utils.fromWei).toHaveBeenCalledWith(1000, 'ether');
      expect(mockWeb3.eth.getBlock).toHaveBeenCalledWith(1000);
      expect(createQueryBuilder).toHaveBeenCalled();
      expect(insert).toHaveBeenCalled();
      expect(into).toHaveBeenCalledWith(Transfer);
      expect(values).toHaveBeenCalledWith({
        date: new Date(1626623970000),
        amount: '1000',
        block: 1000,
        sender: 'senderAddress1',
        reciever: 'receiverAddress1',
      });
      expect(orIgnore).toHaveBeenCalled();
      expect(execute).toHaveBeenCalled();
    });

    it('should save transfer with Date.now if the block does not have a timestamp', async () => {
      const event = {
        returnValues: {
          src: 'senderAddress1',
          dst: 'receiverAddress1',
          wad: 1000,
        },
        blockNumber: 1000,
      };
      const mockDate = new Date(1487076708000);
      jest.spyOn(global, 'Date').mockReturnValue(mockDate);
      mockWeb3.eth.getBlock.mockImplementationOnce(() => undefined);

      await transferService.saveTransfer(mockWeb3, event);

      expect(mockWeb3.utils.fromWei).toHaveBeenCalledWith(1000, 'ether');
      expect(mockWeb3.eth.getBlock).toHaveBeenCalledWith(1000);
      expect(createQueryBuilder).toHaveBeenCalled();
      expect(insert).toHaveBeenCalled();
      expect(into).toHaveBeenCalledWith(Transfer);
      expect(values).toHaveBeenCalledWith({
        date: mockDate,
        amount: '1000',
        block: 1000,
        sender: 'senderAddress1',
        reciever: 'receiverAddress1',
      });
      expect(orIgnore).toHaveBeenCalled();
      expect(execute).toHaveBeenCalled();
    });

    it('should catch and log the error if something goes wrong', async () => {
      const event = {
        returnValues: {
          src: 'senderAddress1',
          dst: 'receiverAddress1',
          wad: 1000,
        },
        blockNumber: 1000,
      };
      createQueryBuilder.mockImplementationOnce(() => {
        throw new Error('Uh Oh');
      });

      await transferService.saveTransfer(mockWeb3, event);

      expect(mockWeb3.utils.fromWei).toHaveBeenCalledWith(1000, 'ether');
      expect(mockWeb3.eth.getBlock).toHaveBeenCalledWith(1000);
      expect(createQueryBuilder).toHaveBeenCalled();
      expect(insert).not.toHaveBeenCalled();
      expect(into).not.toHaveBeenCalled();
      expect(values).not.toHaveBeenCalled();
      expect(orIgnore).not.toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe('Create', () => {
    it('should create a new transfer successfully', async () => {
      const tranfer = {
        date: new Date(),
        amount: '1000',
        block: 1000,
        sender: 'senderAddress1',
        reciever: 'receiverAddress1',
      };
      await transferService.create(tranfer);

      expect(createQueryBuilder).toHaveBeenCalled();
      expect(insert).toHaveBeenCalled();
      expect(into).toHaveBeenCalledWith(Transfer);
      expect(values).toHaveBeenCalledWith(tranfer);
      expect(orIgnore).toHaveBeenCalled();
      expect(execute).toHaveBeenCalled();
    });
  });

  describe('FindOne', () => {
    it('should find the transfer by id successfully', async () => {
      await transferService.findOne(1);

      expect(transfersRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('FetchPreviousTransfers', () => {
    it('should fetch all previous transfers from infura', async () => {
      await transferService.fetchPreviousTransfers(mockWeb3, contract);

      expect(getPastEvents).toHaveBeenCalledWith('Transfer', {
        fromBlock: 3480,
        toBlock: 'latest',
      });

      expect(mockWeb3.utils.fromWei).toHaveBeenCalledTimes(2);
      expect(mockWeb3.eth.getBlock).toHaveBeenCalledTimes(2);
      expect(createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(insert).toHaveBeenCalledTimes(2);
      expect(into).toHaveBeenCalledWith(Transfer);
      expect(values).toHaveBeenCalledTimes(2);
      expect(orIgnore).toHaveBeenCalledTimes(2);
      expect(execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('WatchForNewTransfers', () => {
    it('should create an event listener for new transfers', async () => {
      await transferService.watchForNewTransfers(mockWeb3, contract);

      expect(transferMock).toHaveBeenCalledWith({ fromBlock: 'latest' });
      expect(on).toHaveBeenCalled();
    });
  });

  describe('findAllExcludingBlackList', () => {
    it('should find all transfers that do not belong to a blacklisted address', async () => {
      await transferService.findAllExcludingBlackList(['blackListedAddress1']);

      expect(createQueryBuilder).toHaveBeenCalledWith('transfer');
      expect(select).toHaveBeenCalledWith([
        '"sender"',
        'SUM(CAST("amount" AS DECIMAL)) AS total_amount',
      ]);
      expect(groupBy).toHaveBeenCalledWith('"sender"');
      expect(orderBy).toHaveBeenCalledWith('total_amount', 'DESC');
      expect(take).toHaveBeenCalledWith(10);
      expect(where).toHaveBeenCalledWith(
        'transfer.sender NOT IN (:...senderIds)',
        { senderIds: ['blackListedAddress1'] },
      );
      expect(andWhere).toHaveBeenCalledWith(
        'transfer.reciever NOT IN (:...recieverIds)',
        { recieverIds: ['blackListedAddress1'] },
      );
      expect(getRawMany).toBeCalled();
    });

    it('should not use the where filter if no address are provided', async () => {
      await transferService.findAllExcludingBlackList([]);

      expect(createQueryBuilder).toHaveBeenCalledWith('transfer');
      expect(select).toHaveBeenCalledWith([
        '"sender"',
        'SUM(CAST("amount" AS DECIMAL)) AS total_amount',
      ]);
      expect(groupBy).toHaveBeenCalledWith('"sender"');
      expect(orderBy).toHaveBeenCalledWith('total_amount', 'DESC');
      expect(take).toHaveBeenCalledWith(10);
      expect(getRawMany).toBeCalled();
    });
  });

  describe('onModuleInit', () => {
    it('should not call any functionality when running in test mode (for the e2e tests)', async () => {
      process.env.NODE_ENV = 'test';
      await transferService.onModuleInit();

      expect(mockWeb3.providers.WebsocketProvider).not.toHaveBeenCalled();
    });

    it('should set up a web3 provider, fetch previous data & set up an event listener', async () => {
      process.env.NODE_ENV = 'Not Test';
      importedOn.mockImplementationOnce((event, callback) => callback());
      await transferService.onModuleInit();

      expect(WebSocketProvider).toHaveBeenCalledWith(
        'wss://mainnet.infura.io/ws/v3/db_infura_api_key',
      );
      expect(Web3).toHaveBeenCalled();
      expect(Contract).toHaveBeenCalledWith(
        abi,
        '6b175474e89094c44da98b954eedeac495271d0f',
      );

      expect(importedOn).toHaveBeenCalled();
    });
  });
});
