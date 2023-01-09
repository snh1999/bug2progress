import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

// add  app.useGlobalInterceptors(new LoggerInterceptor()); to main.ts

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const body = request.body || ' ';
    const useragent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;
    const user = request['user'] || 'Not logged in';
    const timeStart = Date.now();

    return next.handle().pipe(
      tap((res) => {
        const logString1 =
          `${method} ${url} by USER: ${user} ${useragent} with IP = ${ip}, invoked` +
          ` HANDLER: ${context.getHandler().name}` +
          ` of CLASS: ${context.getClass().name}`;
        this.logger.log(logString1);
        const logString2 = `with BODY: ${body}`;
        if (body) this.logger.debug(logString2);

        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const logString3 = `returned with StatusCode ${statusCode} in ${
          Date.now() - timeStart
        } ms`;
        this.logger.log(logString3);
        this.logger.debug(res);
      }),
    );
  }
}
