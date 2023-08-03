import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlackListController } from './blacklist.controller';
import { BlackListService } from './blacklist.service';
import { BlackListSchema } from './blacklist.entity';

@Module({
  controllers: [BlackListController],
  providers: [BlackListService],
  imports: [TypeOrmModule.forFeature([BlackListSchema])],
  exports: [BlackListService],
})
export class BlacklistModule {}
