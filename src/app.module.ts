import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { EmployeesModule } from './employees/employees.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ServiceCatalogModule } from './service-catalog/service-catalog.module';
import { AvailabilityModule } from './availability/availability.module';
import { HealthModule } from './health/health.module';
import { CrmModule } from './crm/crm.module';
import { MediaModule } from './media/media.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
      csrfPrevention: false,
      cache: 'bounded',
    }),

    HealthModule,
    UsersModule,
    BookingsModule,
    AuthModule,
    BusinessesModule,
    EmployeesModule,
    ServiceCatalogModule,
    AvailabilityModule,
    ReviewsModule,
    CrmModule,
    MediaModule,
    AmenitiesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
