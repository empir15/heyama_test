import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectsGateway } from './objects.gateway';
import { ObjectItem, ObjectItemSchema } from './schemas/object.schema';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ObjectItem.name, schema: ObjectItemSchema },
    ]),
    StorageModule,
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsGateway],
  exports: [ObjectsService],
})
export class ObjectsModule {}
