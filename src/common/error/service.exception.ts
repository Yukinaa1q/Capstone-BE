import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseCode } from './error.enum';

export class ServiceException extends HttpException {
  constructor(
    code: ResponseCode,
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode, { cause: code });
  }
}
