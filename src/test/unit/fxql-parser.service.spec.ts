/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { FxqlParserService } from '../../fxql/services/fxql-parser.service';
import { LoggerService } from '../../logger/logger.service';
import { BadRequestException } from '@nestjs/common';

describe('FxqlParserService', () => {
  let service: FxqlParserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlParserService,
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FxqlParserService>(FxqlParserService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse valid FXQL statement', () => {
    const validStatement = `USD-GBP {
      BUY 100
      SELL 200
      CAP 93800
    }`;

    const result = service.parse(validStatement);
    expect(result).toEqual([
      {
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 100,
        sellPrice: 200,
        capAmount: 93800,
      },
    ]);
  });

  it('should handle multiple valid statements', () => {
    const validStatements = `
      USD-GBP {
        BUY 100
        SELL 200
        CAP 93800
      }
      EUR-USD {
        BUY 1.1
        SELL 1.2
        CAP 50000
      }
    `;

    const result = service.parse(validStatements);
    expect(result).toHaveLength(2);
  });

  it('should throw error for invalid currency code', () => {
    const invalidStatement = `US-GBP {
      BUY 100
      SELL 200
      CAP 93800
    }`;

    expect(() => service.parse(invalidStatement)).toThrow(BadRequestException);
  });

  it('should throw error for invalid number format', () => {
    const invalidStatement = `USD-GBP {
      BUY abc
      SELL 200
      CAP 93800
    }`;

    expect(() => service.parse(invalidStatement)).toThrow(BadRequestException);
  });

  it('should throw error for negative CAP', () => {
    const invalidStatement = `USD-GBP {
      BUY 100
      SELL 200
      CAP -100
    }`;

    expect(() => service.parse(invalidStatement)).toThrow(BadRequestException);
  });
});