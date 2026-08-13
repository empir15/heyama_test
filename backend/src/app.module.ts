import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsModule } from './objects/objects.module';
import { StorageModule } from './storage/storage.module';

const logger = new Logger('AppModule');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/heyama',
        );
        logger.log(`Initialisation de la connexion MongoDB vers : ${uri.includes('@') ? uri.split('@')[1] : uri}`);
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    StorageModule,
    ObjectsModule,
  ],
})
export class AppModule {}
