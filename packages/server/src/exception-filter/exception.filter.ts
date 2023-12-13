import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ConsoleLogger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import * as HttpErrorTypeGuards from './httpError';
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message?: string;
  error?: any;
  stackTrace?: string;
}
/**
 * Custom exception filter for handling HTTP exceptions and returning consistent error responses.
 */
@Catch()
export class AllExceptionsFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private env;
  /**
   * Creates an instance of HttpExceptionFilter.
   * @param logErrors - Whether to log error messages. Default is false.
   */
  constructor(
    private readonly logger = new ConsoleLogger(AllExceptionsFilter.name),
    private readonly configService: ConfigService,
  ) {
    super();
  }

  /**
   * Logs the error response.
   * @param errorResponse - The error response object.
   */
  private logError(errorResponse: ErrorResponse) {
    this.logger.error(errorResponse.message);
  }
  /**
   * Catches and handles the HTTP exception.
   * @param exception - The HTTP exception.
   * @param host - The arguments host.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const start = Date.now();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };
    if (exception instanceof HttpException) {
      errorResponse.error = exception.getResponse();
    }

    if (
      this.configService.get('NODE_ENV') === 'dev' &&
      exception instanceof Error &&
      exception.stack
    ) {
      errorResponse.stackTrace = exception.stack;
    }

    const guards: { [key: string]: (e: any) => boolean } = {
      ...HttpErrorTypeGuards,
      // ...MongooseErrorTypeGuards,
      // ...FileSystemGuards,
      // ...GeneralGuards,
    };

    const exceptions = Object.entries(guards);
    for (const [name, guard] of exceptions) {
      if (guard(exception)) {
        this.logger.error(`${name.replace('is', '')} Exception`);
        break;
      }
    }

    const elapsedTime = Date.now() - start;
    this.logger.error(
      `[${new Date().toISOString()}] ${request.method} ${
        request.url
      } [${status}] - ${
        message ? 'Error: ' + message : 'No error'
      } - Elapsed Time: ${elapsedTime}ms`,
    );
    this.logger.error(
      `[${new Date().toISOString()}] Method: ${request.method} | URL: ${
        request.url
      } | IP: ${request.ip} | Params: ${JSON.stringify(
        request.params,
      )} | Query: ${JSON.stringify(request.query)} | Body: ${JSON.stringify(
        request.body,
      )} | Headers: ${JSON.stringify(
        request.headers,
      )} | Status Code: ${status}${
        message ? ' | Error: ' + message : ''
      } | Elapsed Time: ${elapsedTime}ms`,
    );

    // Make sure not to log sensitive information from the request
    const safeRequestInfo = {
      headers: request.headers,
      body: request.body, // ensure no sensitive info is here
      query: request.query,
      params: request.params,
    };
    this.logger.log('Request Details:');
    this.logger.log(JSON.stringify(safeRequestInfo));

    response.status(status).json(errorResponse);
  }
}
