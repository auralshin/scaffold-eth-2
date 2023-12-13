import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';

/**
 * Checks if the exception is a BadRequestException.
 * @param exception - The HTTP exception.
 * @returns True if it is a BadRequestException, false otherwise.
 */
export function isBadRequest(
  exception: unknown,
): exception is BadRequestException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.BAD_REQUEST
  );
}

/**
 * Checks if the exception is a NotFoundException.
 * @param exception - The HTTP exception.
 * @returns True if it is a NotFoundException, false otherwise.
 */
export function isNotFound(
  exception: HttpException,
): exception is NotFoundException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.NOT_FOUND
  );
}
/**
 * Checks if the exception is an UnauthorizedException.
 * @param exception - The HTTP exception.
 * @returns True if it is an UnauthorizedException, false otherwise.
 */
export function isUnauthorized(
  exception: HttpException,
): exception is UnauthorizedException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.UNAUTHORIZED
  );
}
/**
 * Checks if the exception is a ForbiddenException.
 * @param exception - The HTTP exception.
 * @returns True if it is a ForbiddenException, false otherwise.
 */
export function isForbidden(
  exception: HttpException,
): exception is ForbiddenException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.FORBIDDEN
  );
}

/**
 * Checks if the exception is an InternalServerErrorException.
 * @param exception - The HTTP exception.
 * @returns True if it is an InternalServerErrorException, false otherwise.
 */
export function isInternalServerError(
  exception: HttpException,
): exception is InternalServerErrorException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR
  );
}

export function isConflict(exception: unknown): exception is ConflictException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.CONFLICT
  );
}

export function isUnsupportedMediaType(
  exception: unknown,
): exception is UnsupportedMediaTypeException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.UNSUPPORTED_MEDIA_TYPE
  );
}

export function isPayloadTooLarge(
  exception: unknown,
): exception is PayloadTooLargeException {
  return (
    exception instanceof HttpException &&
    exception.getStatus() === HttpStatus.PAYLOAD_TOO_LARGE
  );
}
