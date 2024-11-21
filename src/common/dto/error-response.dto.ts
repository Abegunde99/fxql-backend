/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid currency code format',
  })
  message: string;

  @ApiProperty({
    description: 'Error code',
    example: 'FXQL-400',
  })
  code: string;

  @ApiProperty({
    description: 'Detailed error information',
    required: false,
    example: {
      line: 1,
      column: 5,
      details: 'Currency code must be exactly 3 uppercase letters',
    },
  })
  details?: Record<string, any>;
}