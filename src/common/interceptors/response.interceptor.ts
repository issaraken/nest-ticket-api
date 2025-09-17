import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  statusCode: number
  timestamp: string
  data: T
  message: string
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<{
      statusCode: number
    }>()
    const statusCode: number = response.statusCode

    return next.handle().pipe(
      map((data: T) => {
        const apiResponse: ApiResponse<T> = {
          statusCode: statusCode,
          timestamp: new Date().toISOString(),
          data: data,
          message: this.getSuccessMessage(context),
        }
        return apiResponse
      }),
    )
  }

  private getSuccessMessage(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<{ method: string }>()
    const method = request.method as keyof typeof messages
    const messages = {
      GET: 'Data retrieved successfully',
      POST: 'Resource created successfully',
      PATCH: 'Resource updated successfully',
      PUT: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    }

    return messages[method] || 'Operation completed successfully'
  }
}
