import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransferController } from './transfers.controller';
import { TransferService } from './transfers.service';
import { TransferSchema } from './transfers.entity';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  controllers: [TransferController],
  providers: [TransferService],
  imports: [TypeOrmModule.forFeature([TransferSchema]), BlacklistModule],
  exports: [TransferService],
})
export class TransfersModule {}
