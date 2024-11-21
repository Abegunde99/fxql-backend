/* eslint-disable prettier/prettier */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class FxqlStatementDto {
  @ApiProperty({
    description: 'FXQL statement string',
    example: `USD-GBP {
  BUY 100
  SELL 200
  CAP 93800
}`,
    minLength: 1,
    maxLength: 50000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  FXQL: string;
}

export class FxqlEntryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the entry',
    example: 1,
  })
  EntryId: number;

  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  SourceCurrency: string;

  @ApiProperty({
    description: 'Destination currency code',
    example: 'GBP',
    minLength: 3,
    maxLength: 3,
  })
  DestinationCurrency: string;

  @ApiProperty({
    description: 'Buy price in destination currency',
    example: 0.85,
    minimum: 0,
  })
  BuyPrice: number;

  @ApiProperty({
    description: 'Sell price in destination currency',
    example: 0.90,
    minimum: 0,
  })
  SellPrice: number;

  @ApiProperty({
    description: 'Maximum transaction amount in source currency',
    example: 10000,
    minimum: 0,
  })
  CapAmount: number;
}

export class FxqlResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'FXQL Statement Parsed Successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'Response code',
    example: 'FXQL-200',
  })
  code: string;

  @ApiProperty({
    description: 'Parsed and stored FXQL entries',
    type: [FxqlEntryResponseDto],
  })
  data: FxqlEntryResponseDto[];
}