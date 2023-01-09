import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private config: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    let responseBody, httpStatus, httpmessage, errorMessage;
    const ctx = host.switchToHttp();
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      httpmessage = exception.message;
      errorMessage = exception.name;
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      httpmessage = 'Something went wrong';
      errorMessage = 'Internal Server Error';
    }

    if (this.config.get('Environment') == 'DEV') {
      responseBody = {
        statusCode: httpStatus,
        message: httpmessage,
        error: errorMessage,
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };
    } else {
      responseBody = {
        statusCode: httpStatus,
        message: httpmessage,
        timestamp: new Date().toISOString(),
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
