import { ValidationPipe } from '@nestjs/common'

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // Remove non-decorated properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Transform payload to DTO class instance
      transformOptions: {
        enableImplicitConversion: true, // Convert string to number automatically
      },
      errorHttpStatusCode: 422, // Use 422 for validation errors
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints || {}
          return Object.values(constraints).join(', ')
        })

        return {
          statusCode: 422,
          error: 'Validation Failed',
          message: messages,
        }
      },
    })
  }
}
