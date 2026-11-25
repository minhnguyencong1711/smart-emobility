import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof rawBody === 'string'
        ? rawBody
        : Array.isArray((rawBody as { message?: unknown }).message)
          ? (rawBody as { message: string[] }).message.join('; ')
          : ((rawBody as { message?: string }).message ?? 'Request failed');

    response.status(status).json({
      statusCode: status,
      message,
      error: exception instanceof Error ? exception.name : 'Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
