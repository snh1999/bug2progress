import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  Catch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  responseBody!: string;
  httpStatus!: number;
  httpMessage!: string;
  errorTitle!: string;
  exceptionStack: any;
  reason: any;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private config: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    let responseBody;
    const ctx = host.switchToHttp();
    const path = httpAdapter.getRequestUrl(ctx.getRequest());

    if (exception instanceof HttpException) {
      this.httpStatus = exception.getStatus();
      this.httpMessage = exception.message;
      this.errorTitle = exception.name;
      this.exceptionStack = exception;
      if (exception instanceof BadRequestException || UnauthorizedException) {
        this.reason = exception.getResponse();
        if (this.reason.message == this.httpMessage) {
          this.reason = undefined;
          this.exceptionStack = undefined;
        }
      }
    } else {
      this.handleServerError(exception);
    }

    if (this.config.get('NODE_ENV') == 'DEV') {
      responseBody = this.sendDevResponse(exception);
    } else {
      responseBody = this.sendProdResponse(path);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, this.httpStatus);
  }

  handleServerError(exception: unknown) {
    this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof PrismaClientInitializationError) {
      this.handlePrismaClientInitializationError();
    } else if (exception instanceof PrismaClientKnownRequestError) {
      this.handlePrismaClientKnownRequestError(exception);
    } else if (exception instanceof PrismaClientValidationError) {
      this.handlePrismaClientValidationError();
    } else {
      this.handleUnknownServerError();
    }
  }
  handlePrismaClientInitializationError() {
    this.httpMessage = 'Internal Server Error';
    this.errorTitle = 'Database Not Connected';
  }

  handlePrismaClientKnownRequestError(
    exception: PrismaClientKnownRequestError,
  ) {
    if (exception.code == 'P2002') {
      this.httpStatus = HttpStatus.CONFLICT;
      this.httpMessage = `Duplicate field ${exception.meta?.target || ''}`;
      this.errorTitle = 'Unique Constraint failed';
    } else if (exception.code == 'P2025') {
      this.httpStatus = HttpStatus.NOT_FOUND;
      this.httpMessage = exception.message;
      this.errorTitle = 'Not found';
    } else this.handleUnknownServerError();
  }

  handlePrismaClientValidationError() {
    this.httpMessage = 'Internal Server Error';
    this.errorTitle = 'Invalid Input';
  }

  handleUnknownServerError() {
    this.httpMessage = 'Internal Server Error';
  }

  sendDevResponse(exception: unknown) {
    // error message not defined, log the exception
    if (!this.errorTitle) {
      console.log(exception);
      this.errorTitle = 'Something went wrong';
    }
    return {
      statusCode: this.httpStatus,
      message: this.httpMessage,
      error: this.errorTitle,
      details: this.reason ? this.reason.message : this.exceptionStack,
    };
  }
  sendProdResponse(path: unknown) {
    const reason = this.reason ? this.reason.message : undefined;
    return {
      statusCode: this.httpStatus,
      message: this.httpMessage,
      timestamp: new Date().toISOString(),
      path,
      details: reason,
    };
  }
}
