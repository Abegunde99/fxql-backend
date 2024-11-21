/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlController } from './controllers/fxql.controller';
import { FxqlService } from './services/fxql.service';
import { FxqlParserService } from './services/fxql-parser.service';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FxqlEntry]),
    LoggerModule,
  ],
  controllers: [FxqlController],
  providers: [FxqlService, FxqlParserService],
  exports: [FxqlService],
})
export class FxqlModule {}