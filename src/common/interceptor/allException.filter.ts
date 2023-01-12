import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientInitializationError } from '@prisma/client/runtime';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  responseBody: string;
  httpStatus: number;
  httpmessage: string;
  errorTitle: string;
  exceptionStack: any;
  reason: any;
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private config: ConfigService,
  ) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    let responseBody;
    const ctx = host.switchToHttp();
    const path = httpAdapter.getRequestUrl(ctx.getRequest());

    if (exception instanceof HttpException) {
      this.httpStatus = exception.getStatus();
      this.httpmessage = exception.message;
      this.errorTitle = exception.name;
      this.exceptionStack = exception;
      if (exception instanceof BadRequestException || UnauthorizedException) {
        this.reason = exception.getResponse();
        if (this.reason.message == this.httpmessage) {
          this.reason = undefined;
          // this.exceptionStack = undefined;
        }
      }
    } else {
      this.handleServerError(exception);
    }
    // check environment and send response accordingly
    if (this.config.get('Environment') == 'DEV') {
      responseBody = this.sendDevResponse(exception);
    } else {
      responseBody = this.sendProdResponse(path);
    }
    // sending response
    httpAdapter.reply(ctx.getResponse(), responseBody, this.httpStatus);
  }
  // ################################# handle specific errors #####################
  handleServerError(exception: unknown) {
    this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof PrismaClientInitializationError) {
      this.handlePrismaClientInitializationError();
    } else {
      this.handleUnknownServerError();
    }
  }
  handlePrismaClientInitializationError() {
    this.httpmessage = 'Internal Server Error';
    this.errorTitle = 'Database Not Connected';
  }
  handleUnknownServerError() {
    this.httpmessage = 'Internal Server Error';
  }
  // #################################### building responses #####################
  sendDevResponse(exception: unknown) {
    // errormessage not defined, log the exception
    if (!this.errorTitle) {
      console.log(exception);
      this.errorTitle = 'Something went wrong';
    }
    return {
      statusCode: this.httpStatus,
      message: this.httpmessage,
      error: this.errorTitle,
      details: this.reason ? this.reason.message : this.exceptionStack,
    };
  }
  sendProdResponse(path) {
    const reason = this.reason ? this.reason.message : undefined;
    return {
      statusCode: this.httpStatus,
      message: this.httpmessage,
      timestamp: new Date().toISOString(),
      path,
      details: reason,
    };
  }
}
