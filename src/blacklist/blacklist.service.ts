import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlackList } from './blacklist.entity';

@Injectable()
export class BlackListService {
  constructor(
    @InjectRepository(BlackList)
    private BlackListRepository: Repository<BlackList>,
  ) {}

  async findAll(): Promise<BlackList[]> {
    return this.BlackListRepository.find();
  }

  create(blacklist: BlackList): Promise<BlackList> {
    const newBlackList = this.BlackListRepository.create(blacklist);
    return this.BlackListRepository.save(newBlackList);
  }

  findOne(id: number): Promise<BlackList | null> {
    return this.BlackListRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.BlackListRepository.delete(id);
  }
}
