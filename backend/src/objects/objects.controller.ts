import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  /**
   * POST /objects
   * Accepts multipart/form-data with:
   * - title (string)
   * - description (string)
   * - file (image file)
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          return callback(
            new BadRequestException(
              'Format de fichier non supporté. Seules les images (jpg, png, webp, gif, svg) sont autorisées.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createObjectDto: CreateObjectDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.objectsService.create(createObjectDto, file);
  }

  /**
   * GET /objects
   * Returns list of all objects
   */
  @Get()
  async findAll() {
    return this.objectsService.findAll();
  }

  /**
   * GET /objects/:id
   * Returns a single object by id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  /**
   * DELETE /objects/:id
   * Deletes object from MongoDB and image from S3
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.objectsService.remove(id);
  }
}
