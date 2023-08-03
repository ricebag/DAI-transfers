import { Controller, Get, Param } from '@nestjs/common';

import { TransferService } from './transfers.service';
import { Transfer } from './transfers.entity';
import { BlackListService } from '../blacklist/blacklist.service';

@Controller('transfer')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    private readonly blackListedService: BlackListService,
  ) {}

  @Get()
  async findAll(): Promise<Transfer[]> {
    try {
      const blacklistedWallets = await this.blackListedService.findAll();
      const addresses = blacklistedWallets.map(
        (wallet) => wallet.walletAddress,
      );

      return this.transferService.findAllExcludingBlackList(addresses);
    } catch (e) {
      throw new Error(`Error fetching results: ${e.message}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Transfer> {
    const transfer = await this.transferService.findOne(id);

    if (!transfer) {
      throw new Error(`No tranfer recorded with the id: ${id}`);
    } else {
      return transfer;
    }
  }
}
