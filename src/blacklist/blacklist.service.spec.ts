import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BlackListService } from './blacklist.service';
import { BlackList } from './blacklist.entity';

describe('BlackListService', () => {
  let blackListService: BlackListService;
  let blackListRepositoryMock: any;

  const responseFromCreate = 'Create this please';
  const findOneBy = jest.fn();
  const save = jest.fn();
  const create = jest.fn(() => responseFromCreate);
  const find = jest.fn();
  const deleteMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlackListService,
        {
          provide: getRepositoryToken(BlackList),
          useValue: {
            find,
            save,
            create,
            delete: deleteMock,
            findOneBy,
          },
        },
      ],
    }).compile();

    blackListService = module.get<BlackListService>(BlackListService);
    blackListRepositoryMock = module.get(getRepositoryToken(BlackList));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find all blacklisted address records', async () => {
    await blackListService.findAll();

    expect(find).toHaveBeenCalled();
  });

  it('should create a new transfer successfully', async () => {
    const blackListWallets = {
      walletAddress: 'blackListedWallet1',
    };
    await blackListService.create(blackListWallets);

    expect(create).toHaveBeenCalledWith(blackListWallets);
    expect(save).toHaveBeenCalledWith(responseFromCreate);
  });

  it('should find the blacklisted address by id successfully', async () => {
    await blackListService.findOne(1);

    expect(blackListRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should create an event listener for new transfers', async () => {
    await blackListService.remove(1);

    expect(deleteMock).toHaveBeenCalledWith(1);
  });
});
