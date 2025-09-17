import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

interface ErrorResponse {
  statusCode: number
  timestamp: string
  error: string
  message: string | string[]
}

interface HttpExceptionResponse {
  message?: string | string[]
  error?: string
  statusCode?: number
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const errorResponse = this.buildErrorResponse(exception)
    response.status(errorResponse.statusCode).json(errorResponse)
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    const timestamp = new Date().toISOString()

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, timestamp)
    }

    if (exception instanceof Error) {
      return this.handleGenericError(exception, timestamp)
    }

    return this.handleUnknownException(timestamp)
  }

  private handleHttpException(
    exception: HttpException,
    timestamp: string,
  ): ErrorResponse {
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    if (this.isObject(exceptionResponse)) {
      const { message, error } = exceptionResponse as HttpExceptionResponse
      return {
        statusCode: status,
        timestamp,
        error: error || this.getErrorNameByStatus(status),
        message: message || exception.message,
      }
    }

    return {
      statusCode: status,
      timestamp,
      error: this.getErrorNameByStatus(status),
      message: exceptionResponse as string,
    }
  }

  private handleGenericError(
    exception: Error,
    timestamp: string,
  ): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      error: 'Internal Server Error',
      message: exception.message || 'An internal server error occurred',
    }
  }

  private handleUnknownException(timestamp: string): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    }
  }

  private isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null
  }

  private getErrorNameByStatus(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    }

    return errorNames[status] || 'Error'
  }
}
