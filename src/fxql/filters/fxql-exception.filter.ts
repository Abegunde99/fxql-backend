/* eslint-disable prettier/prettier */
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  
  @Catch()
  export class FxqlExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let code = 'FXQL-500';
      let details = {};
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;
        
        message = exceptionResponse.message || 'Bad request';
        code = `FXQL-${status}`;
        details = exceptionResponse.details || {};
      }
  
      response
        .status(status)
        .json({
          message,
          code,
          details,
        });
    }
  }