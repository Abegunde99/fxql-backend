/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxqlEntry } from '../entities/fxql-entry.entity';
import { FxqlParserService } from './fxql-parser.service';

@Injectable()
export class FxqlService {
  constructor(
    @InjectRepository(FxqlEntry)
    private readonly fxqlRepository: Repository<FxqlEntry>,
    private readonly parserService: FxqlParserService,
  ) {}

  async processStatement(fxqlStatement: string) {
    const parsedEntries = this.parserService.parse(fxqlStatement);
    const savedEntries: FxqlEntry[] = [];

    for (const entry of parsedEntries) {
      try {
        const savedEntry = await this.fxqlRepository.save({
          source_currency: entry.sourceCurrency,
          destination_currency: entry.destinationCurrency,
          buy_price: entry.buyPrice,
          sell_price: entry.sellPrice,
          cap_amount: entry.capAmount,
        });
        savedEntries.push(savedEntry);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          const existingEntry = await this.fxqlRepository.findOne({
            where: {
              source_currency: entry.sourceCurrency,
              destination_currency: entry.destinationCurrency
            }
          });
          
          if (existingEntry) {
            const updatedEntry = await this.fxqlRepository.save({
              ...existingEntry,
              buy_price: entry.buyPrice,
              sell_price: entry.sellPrice,
              cap_amount: entry.capAmount,
            });
            savedEntries.push(updatedEntry);
          }
        } else {
          throw error;
        }
      }
    }

    return {
      message: 'FXQL Statement Parsed Successfully.',
      code: 'FXQL-200',
      data: savedEntries.map(entry => ({
        EntryId: entry.entry_id,
        SourceCurrency: entry.source_currency,
        DestinationCurrency: entry.destination_currency,
        BuyPrice: entry.buy_price,
        SellPrice: entry.sell_price,
        CapAmount: entry.cap_amount,
      })),
    };
  }
}