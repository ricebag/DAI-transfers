import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransfersModule } from './transfers/transfers.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import config from './config/config';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config], cache: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:
        process.env.NODE_ENV === 'test'
          ? (configService: ConfigService) => ({
              type: 'sqlite',
              database: configService.get('DATABASE_NAME_FOR_TEST'),
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: true,
            })
          : (configService: ConfigService) => ({
              type: 'postgres',
              host: configService.get('database.host'),
              port: configService.get('database.port'),
              username: configService.get('database.user'),
              password: configService.get('database.pass'),
              database: configService.get('database.name'),
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: true,
            }),
    }),
    BlacklistModule,
    TransfersModule,
  ],
})
export class AppModule {}
