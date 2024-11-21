/* eslint-disable prettier/prettier */
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FxqlEntry } from '../../fxql/entities/fxql-entry.entity';

export const TestDatabaseModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const dbUrl = configService.get<string>('DATABASE_URL');
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in test environment');
    }

    return {
      type: 'postgres',
      url: dbUrl,
      entities: [FxqlEntry],
      synchronize: false, 
      dropSchema: false,
      ssl: false,
      logging: ['error'],
      autoLoadEntities: true,
    };
  },
  inject: [ConfigService],
});