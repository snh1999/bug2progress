import { ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

export class HandlePrismaDuplicateError {
  constructor(error: Error, message?: string) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ForbiddenException(`Field '${message}' already exists`);
    } else {
      throw error;
    }
  }
}
