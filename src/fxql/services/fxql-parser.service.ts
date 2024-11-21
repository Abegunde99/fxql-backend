/* eslint-disable prettier/prettier */

import { Injectable, BadRequestException } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

interface ParsedEntry {
    sourceCurrency: string;
    destinationCurrency: string;
    buyPrice: number;
    sellPrice: number;
    capAmount: number;
}

@Injectable()
export class FxqlParserService {
  private readonly currencyRegex = /^[A-Z]{3}$/;
  private readonly numberRegex = /^\d+(\.\d+)?$/;

  constructor(private readonly logger: LoggerService) {}

  parse(fxqlStatement: string): ParsedEntry[] {
    const entries: ParsedEntry[] = [];
    const statements = this.splitStatements(fxqlStatement);

    if (statements.length > 1000) {
      throw new BadRequestException('Maximum of 1000 currency pairs allowed per request');
    }

    for (const [index, statement] of statements.entries()) {
      try {
        const entry = this.parseStatement(statement);
        entries.push(entry);
      } catch (error) {
        this.logger.error(`Error parsing statement at index ${index}`, error);
        throw new BadRequestException(`Error in statement ${index + 1}: ${error.message}`);
      }
    }

    return this.deduplicateEntries(entries);
  }

  private splitStatements(fxqlString: string): string[] {
    return fxqlString
      .trim()
      .split(/}\s*\n\s*(?=[A-Z]{3}-[A-Z]{3}\s*{)/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + (s.endsWith('}') ? '' : '}'));
  }

  private parseStatement(statement: string): ParsedEntry {
    // Currency pair validation
    const currencyPairMatch = statement.match(/^([A-Z]{3})-([A-Z]{3})\s*{/);
    if (!currencyPairMatch) {
      throw new BadRequestException('Invalid currency pair format');
    }

    const [, sourceCurrency, destinationCurrency] = currencyPairMatch;
    if (!this.currencyRegex.test(sourceCurrency) || !this.currencyRegex.test(destinationCurrency)) {
      throw new BadRequestException('Invalid currency code format');
    }

    // Extract values
    const buyMatch = statement.match(/BUY\s+(\d+(?:\.\d+)?)/);
    const sellMatch = statement.match(/SELL\s+(\d+(?:\.\d+)?)/);
    const capMatch = statement.match(/CAP\s+(\d+)/);

    if (!buyMatch || !sellMatch || !capMatch) {
      throw new BadRequestException('Missing required fields (BUY, SELL, or CAP)');
    }

    const buyPrice = parseFloat(buyMatch[1]);
    const sellPrice = parseFloat(sellMatch[1]);
    const capAmount = parseInt(capMatch[1], 10);

    // Validate values
    if (!this.numberRegex.test(buyMatch[1]) || !this.numberRegex.test(sellMatch[1])) {
      throw new BadRequestException('Invalid price format');
    }

    if (capAmount < 0 || !Number.isInteger(capAmount)) {
      throw new BadRequestException('CAP must be a non-negative integer');
    }

    return {
      sourceCurrency,
      destinationCurrency,
      buyPrice,
      sellPrice,
      capAmount,
    };
  }

  private deduplicateEntries(entries: ParsedEntry[]): ParsedEntry[] {
    const dedupMap = new Map<string, ParsedEntry>();
    
    entries.forEach(entry => {
      const key = `${entry.sourceCurrency}-${entry.destinationCurrency}`;
      dedupMap.set(key, entry);
    });

    return Array.from(dedupMap.values());
  }
}