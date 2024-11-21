/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FxqlService } from '../services/fxql.service';
import { FxqlStatementDto, FxqlResponseDto } from '../dto/fxql-statement.dto';

@ApiTags('FXQL')
@Controller('fxql-statements')
export class FxqlController {
  constructor(private readonly fxqlService: FxqlService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Parse and store FXQL statements',
    description: `
  Parses FXQL statements and stores them in the database.
  
  FXQL Format:
  \`\`\`
  CURR1-CURR2 {
    BUY {AMOUNT}
    SELL {AMOUNT}
    CAP {AMOUNT}
  }
  \`\`\`
  
  Rules:
  - CURR1 and CURR2 must be exactly 3 uppercase characters
  - BUY and SELL amounts must be positive numbers
  - CAP must be a positive integer
  - Multiple statements must be separated by newlines
      `,
  })
  @ApiBody({
    type: FxqlStatementDto,
    examples: {
      singleStatement: {
        summary: 'Single FXQL Statement',
        value: {
          FXQL: `USD-GBP {
    BUY 0.85
    SELL 0.90
    CAP 10000
  }`,
        },
      },
      multipleStatements: {
        summary: 'Multiple FXQL Statements',
        value: {
          FXQL: `USD-GBP {
    BUY 0.85
    SELL 0.90
    CAP 10000
  }
  
  EUR-USD {
    BUY 1.10
    SELL 1.15
    CAP 50000
  }`,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'FXQL statements successfully parsed and stored',
    type: FxqlResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid FXQL statement format',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Invalid currency code format',
        },
        code: {
          type: 'string',
          example: 'FXQL-400',
        },
      },
    },
  })
  async parseStatement(@Body() dto: FxqlStatementDto) {
    return this.fxqlService.processStatement(dto.FXQL);
  }
}
