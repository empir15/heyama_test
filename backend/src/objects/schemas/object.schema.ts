import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ObjectItemDocument = ObjectItem & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ObjectItem {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: false })
  imageKey?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ObjectItemSchema = SchemaFactory.createForClass(ObjectItem);

// Virtual for id transformation
ObjectItemSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret: Record<string, any>) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
  },
});
