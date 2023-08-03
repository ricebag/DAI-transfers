import { Test, TestingModule } from '@nestjs/testing';

import { BlackListController } from './blacklist.controller';
import { BlackListService } from './blacklist.service';

const findAll = jest.fn();
const create = jest.fn();
const findOne = jest.fn();
const remove = jest.fn();

const BlackListServiceMock = {
  provide: BlackListService,
  useValue: {
    findAll,
    create,
    findOne,
    remove,
  },
};

describe('BlackListController', () => {
  let blackListController: BlackListController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BlackListController],
      providers: [BlackListServiceMock],
    }).compile();

    blackListController = app.get<BlackListController>(BlackListController);
  });

  describe('findAll()', () => {
    it('should return the data from the service request findAll()', async () => {
      const mockData = [
        { id: 1, walletAddress: '12345' },
        { id: 2, walletAddress: '678910' },
      ];

      findAll.mockResolvedValue(mockData);

      expect(await blackListController.findAll()).toStrictEqual(mockData);
    });
  });

  describe('findOne()', () => {
    it('should return the data from the service request findOne()', async () => {
      const id = 1;
      const mockData = { id: 1, walletAddress: '12345' };
      findOne.mockResolvedValue(mockData);

      expect(await blackListController.findOne(id)).toBe(mockData);
      expect(findOne).toHaveBeenCalledWith(id);
    });

    it('should throw an error if no ', async () => {
      const id = 1;
      findOne.mockResolvedValue(undefined);

      try {
        await blackListController.findOne(id);
      } catch (e) {
        expect(e.message).toBe(
          'No blacklisted record found for that wallet address',
        );
        expect(findOne).toHaveBeenCalledWith(id);
      }
    });
  });

  describe('blackListWallet()', () => {
    it('should return a success message', async () => {
      const walletAddress = 'newAddress';
      const mockData = { id: 1, walletAddress };
      create.mockResolvedValue(mockData);

      expect(
        await blackListController.blackListWallet({ id: 'newAddress' }),
      ).toBe(`The wallet address "${walletAddress}" has been blacklisted`);
      expect(create).toHaveBeenCalledWith({ walletAddress: 'newAddress' });
    });

    it('should throw an error if no ', async () => {
      const errorMessage = 'Uh Oh';
      create.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      try {
        await blackListController.blackListWallet({ id: 'newAddress' });
      } catch (e) {
        expect(e.message).toBe(
          `Error create blacklist record: ${errorMessage}`,
        );
        expect(create).toHaveBeenCalledWith({ walletAddress: 'newAddress' });
      }
    });
  });
});
