import { HttpStatus } from "@nestjs/common";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { get } from "lodash";

export const validationOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export function getPrismaErrorStatusAndMessage(error: any): {
  errorMessage: string | undefined;
  statusCode: number;
} {
  if (
    error instanceof PrismaClientKnownRequestError ||
    error instanceof PrismaClientValidationError
  ) {
    const errorCode = get(error, "code", "DEFAULT_ERROR_CODE");

    const errorCodeMap: Record<string, number> = {
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2003: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
      DEFAULT_ERROR_CODE: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    const statusCode = errorCodeMap[errorCode];
    const errorMessage = error.message.split("\n").pop();

    return { statusCode, errorMessage };
  }

  const statusCode =
    error?.response?.data?.statusCode ||
    error?.status ||
    error?.response?.status ||
    HttpStatus.INTERNAL_SERVER_ERROR;
  return {
    statusCode,
    errorMessage: error?.response?.data?.message || error?.message,
  };
}