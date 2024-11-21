/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FxqlService } from '../services/fxql.service';
import { FxqlStatementDto } from '../dto/fxql-statement.dto';
import { config } from 'dotenv';
config();

@ApiTags('FXQL')
@Controller()
export class FxqlController {
  constructor(private readonly fxqlService: FxqlService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message with API information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' },
        endpoints: {
          type: 'object',
          properties: {
            documentation: { type: 'string' },
            fxql: { type: 'string' },
            health: { type: 'string' }
          }
        },
        features: { 
          type: 'array',
          items: { type: 'string' }
        },
        status: { type: 'string' }
      }
    }
  })
  getWelcome() {
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
    return this.fxqlService.getWelcomeMessage(baseUrl);
  }

  @Post('fxql-statements')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Parse and store FXQL statements' })
  @ApiResponse({
    status: 201,
    description: 'FXQL statements successfully parsed and stored',
  })
  async parseStatement(@Body() dto: FxqlStatementDto) {
    return this.fxqlService.processStatement(dto.FXQL);
  }
}