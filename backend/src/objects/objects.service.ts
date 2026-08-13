import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { ObjectItem, ObjectItemDocument } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { StorageService } from '../storage/storage.service';
import { ObjectsGateway } from './objects.gateway';

@Injectable()
export class ObjectsService {
  private readonly logger = new Logger(ObjectsService.name);

  constructor(
    @InjectModel(ObjectItem.name)
    private readonly objectModel: Model<ObjectItemDocument>,
    private readonly storageService: StorageService,
    private readonly objectsGateway: ObjectsGateway,
  ) {}

  private formatObject(doc: any): any {
    const json = doc.toJSON ? doc.toJSON() : { ...doc };
    const baseUrl =
      process.env.RENDER_EXTERNAL_URL ||
      process.env.APP_URL ||
      '';

    if (baseUrl && json.imageUrl && json.imageUrl.includes('/uploads/')) {
      const filename = json.imageUrl.split('/uploads/')[1];
      json.imageUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${filename}`;
    }
    return json;
  }

  /**
   * Create a new Object: upload image to S3, save to MongoDB, emit socket event
   */
  async create(
    createObjectDto: CreateObjectDto,
    file: Express.Multer.File,
  ): Promise<ObjectItemDocument> {
    if (!file) {
      throw new BadRequestException('Un fichier image est obligatoire');
    }

    // 1. Upload file to S3-compatible storage
    const { url, key } = await this.storageService.uploadFile(file);

    // 2. Save document to MongoDB
    const createdObject = new this.objectModel({
      title: createObjectDto.title,
      description: createObjectDto.description,
      imageUrl: url,
      imageKey: key,
      createdAt: new Date(),
    });

    const saved = await createdObject.save();
    const formatted = this.formatObject(saved);

    // 3. Emit real-time WebSocket event
    this.objectsGateway.emitObjectCreated(formatted);

    this.logger.log(`Created new object ID: ${formatted.id}`);
    return formatted as any;
  }

  /**
   * Retrieve all Objects, sorted from newest to oldest
   */
  async findAll(): Promise<any[]> {
    const list = await this.objectModel.find().sort({ createdAt: -1 }).exec();
    return list.map((item) => this.formatObject(item));
  }

  /**
   * Retrieve a single Object by its ID
   */
  async findOne(id: string): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Format d'identifiant invalide : ${id}`);
    }

    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException(`Objet non trouvé avec l'identifiant : ${id}`);
    }

    return this.formatObject(object);
  }

  /**
   * Delete an Object: remove image from S3, remove from MongoDB, emit socket event
   */
  async remove(id: string): Promise<{ success: boolean; id: string; message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Format d'identifiant invalide : ${id}`);
    }

    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException(`Objet non trouvé avec l'identifiant : ${id}`);
    }

    // 1. Delete image from S3 if key exists
    if (object.imageKey) {
      await this.storageService.deleteFile(object.imageKey);
    }

    // 2. Delete from MongoDB
    await this.objectModel.findByIdAndDelete(id).exec();

    // 3. Emit real-time WebSocket event
    this.objectsGateway.emitObjectDeleted(id);

    this.logger.log(`Deleted object ID: ${id}`);
    return {
      success: true,
      id,
      message: 'Objet supprimé avec succès',
    };
  }
}
