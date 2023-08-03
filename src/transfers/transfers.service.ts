import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { InsertResult, Repository } from 'typeorm';
import { Web3, WebSocketProvider } from 'web3';

import { default as abi } from './abi.json';
import { Transfer } from './transfers.entity';

@Injectable()
export class TransferService implements OnModuleInit {
  constructor(
    @InjectRepository(Transfer)
    private transfersRepository: Repository<Transfer>,
    private configService: ConfigService,
  ) {}

  async saveTransfer(web3, event): Promise<void> {
    const {
      src: from,
      dst: to,
      wad,
    }: { src: string; dst: string; wad: number } = event.returnValues;
    const amountInDAI = web3.utils.fromWei(wad as number, 'ether');

    const block = await web3.eth.getBlock(event.blockNumber);
    const timestamp = block?.timestamp;
    const date = timestamp ? new Date(Number(timestamp) * 1000) : new Date();
    console.log(`Transfer from ${from} to ${to}. Amount: ${amountInDAI}`);

    try {
      this.create({
        date,
        amount: amountInDAI,
        block: event.blockNumber,
        sender: from as string,
        reciever: to as string,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async fetchPreviousTransfers(web3, contract): Promise<void> {
    const latestBlockNumber = await web3.eth.getBlockNumber();

    const secondsPerBlock = 15;
    const blocksPerDay = Math.ceil((24 * 60 * 60) / secondsPerBlock);
    const fromBlockNumber = Number(latestBlockNumber) - 2 * blocksPerDay; // to be sure theres enough data on initial load

    const transferEvents = await contract.getPastEvents('Transfer', {
      fromBlock: fromBlockNumber,
      toBlock: 'latest',
    });

    console.log('Loading previous days transfers');
    transferEvents.forEach((event) => this.saveTransfer(web3, event));
  }

  async watchForNewTransfers(web3, contract): Promise<void> {
    contract.events
      .Transfer({
        fromBlock: 'latest',
      })
      .on('data', async (event) => this.saveTransfer(web3, event));
  }

  async onModuleInit(): Promise<void> {
    // if the service is running in test mode, skip the data load (used for E2E tests)
    if (process.env.NODE_ENV !== 'test') {
      const infuraKey = this.configService.get<string>('infuraApiKey');
      const provider = `wss://mainnet.infura.io/ws/v3/${infuraKey}`;

      const web3Provider = new WebSocketProvider(provider);
      const web3 = new Web3(web3Provider);

      const address = '6b175474e89094c44da98b954eedeac495271d0f';
      const contract = new web3.eth.Contract(abi, address);

      this.fetchPreviousTransfers(web3, contract);
      web3Provider.on('connect', () =>
        this.watchForNewTransfers(web3, contract),
      );
    }
  }

  async findAllExcludingBlackList(
    blacklistedWallets: string[],
  ): Promise<Transfer[]> {
    const queryBuilder = this.transfersRepository
      .createQueryBuilder('transfer')
      .select(['"sender"', 'SUM(CAST("amount" AS DECIMAL)) AS total_amount'])
      .groupBy('"sender"')
      .orderBy('total_amount', 'DESC')
      .take(10);

    if (blacklistedWallets.length) {
      queryBuilder
        .where(`transfer.sender NOT IN (:...senderIds)`, {
          senderIds: blacklistedWallets,
        })
        .andWhere(`transfer.reciever NOT IN (:...recieverIds)`, {
          recieverIds: blacklistedWallets,
        });
    }

    return queryBuilder.getRawMany();
  }

  create(transfer: Transfer): Promise<InsertResult> {
    return this.transfersRepository
      .createQueryBuilder()
      .insert()
      .into(Transfer)
      .values(transfer)
      .orIgnore()
      .execute();
  }

  findOne(id: number): Promise<Transfer | null> {
    return this.transfersRepository.findOneBy({ id });
  }
}
