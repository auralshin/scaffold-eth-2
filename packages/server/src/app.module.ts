import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractModule } from './contract/contract.module';
import { LoggerService } from './logger/logger.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import config from '../config';
import { LoggerMiddleware } from './logger/logger.middleware';
@Module({
  imports: [
    ContractModule,
    LoggerModule,
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      cache: true,
    }),
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 30,
    // }),
    // // DevtoolsModule.register({
    // //   http: process.env.NODE_ENV !== 'prod',
    // // }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (
    //     configService: ConfigService
    //   ) => ({
    //     uri:
    //       configService.get<string>('MONGODB_URI'),
    //     useNewUrlParser: true,
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
