import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { BlackListService } from './blacklist.service';
import { BlackList } from './blacklist.entity';
import { IsAuthed } from '../middleware/auth.gaurd';

@Controller('blacklist')
export class BlackListController {
  constructor(private readonly blackListService: BlackListService) {}

  @Get()
  async findAll(): Promise<BlackList[]> {
    const blacklistedWallets = await this.blackListService.findAll();

    return [...blacklistedWallets];
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<BlackList> {
    const isWalletBlacklisted = await this.blackListService.findOne(id);

    if (!isWalletBlacklisted) {
      throw new Error('No blacklisted record found for that wallet address');
    } else {
      return isWalletBlacklisted;
    }
  }

  @Post()
  @UseGuards(IsAuthed)
  async blackListWallet(
    @Body() blockWalletDto: { id: string },
  ): Promise<string> {
    try {
      await this.blackListService.create({ walletAddress: blockWalletDto.id });
      return `The wallet address "${blockWalletDto.id}" has been blacklisted`;
    } catch (e) {
      throw new Error(`Error create blacklist record: ${e.message}`);
    }
  }
}
