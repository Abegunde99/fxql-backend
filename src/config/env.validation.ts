/* eslint-disable prettier/prettier */
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, validateSync, IsInt, IsBoolean } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  RATE_LIMIT_MAX: number;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  CORS_ENABLED: boolean;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('Environment validation errors:', errors.map(error => ({
      property: error.property,
      constraints: error.constraints,
      value: error.value
    })));
    throw new Error(errors.toString());
  }
  return validatedConfig;
}