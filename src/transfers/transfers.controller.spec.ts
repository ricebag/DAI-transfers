import { Test, TestingModule } from '@nestjs/testing';

import { TransferController } from './transfers.controller';
import { TransferService } from './transfers.service';
import { BlackListService } from '../blacklist/blacklist.service';

const blacklistFindAll = jest.fn();
const findAllExcludingBlackList = jest.fn();
const create = jest.fn();
const findOne = jest.fn();
const remove = jest.fn();

const TransferServiceMock = {
  provide: TransferService,
  useValue: {
    findAllExcludingBlackList,
    create,
    findOne,
    remove,
  },
};

const BlackListServiceMock = {
  provide: BlackListService,
  useValue: {
    findAll: blacklistFindAll,
  },
};

describe('BlackListController', () => {
  let transferController: TransferController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [TransferServiceMock, BlackListServiceMock],
    }).compile();

    transferController = app.get<TransferController>(TransferController);
  });

  describe('findAll()', () => {
    it('should return the data from the service request findAll()', async () => {
      const mockBlackListData = [{ id: 1, walletAddress: 'blocked_address' }];
      const mockTransferData = [
        {
          id: 1,
          block: 12345,
          amount: '1000',
          sender: 'from_address',
          reciever: 'to_address',
          date: Date(),
        },
      ];

      blacklistFindAll.mockResolvedValue(mockBlackListData);
      findAllExcludingBlackList.mockResolvedValue(mockTransferData);

      expect(await transferController.findAll()).toBe(mockTransferData);
      expect(findAllExcludingBlackList).toHaveBeenCalledWith([
        'blocked_address',
      ]);
    });

    it('should throw an error if something goes wrong', async () => {
      blacklistFindAll.mockImplementation(() => {
        throw new Error('Uh Oh');
      });

      try {
        await transferController.findAll();
      } catch (e) {
        expect(e.message).toBe('Error fetching results: Uh Oh');
      }
    });
  });

  describe('findOne()', () => {
    it('should return the data from the service request findOne()', async () => {
      const id = 1;
      const mockData = {
        id: 1,
        block: 12345,
        amount: '1000',
        sender: 'from_address',
        reciever: 'to_address',
        date: Date(),
      };

      findOne.mockResolvedValue(mockData);

      expect(await transferController.findOne(id)).toBe(mockData);
      expect(findOne).toHaveBeenCalledWith(id);
    });

    it('should throw an error if no ', async () => {
      const id = 2;
      findOne.mockResolvedValue(undefined);

      try {
        await transferController.findOne(id);
      } catch (e) {
        expect(e.message).toBe(`No tranfer recorded with the id: ${id}`);
        expect(findOne).toHaveBeenCalledWith(id);
      }
    });
  });
});
