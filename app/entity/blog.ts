import { prop, modelOptions, getModelForClass, Ref, index } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Admin } from './admin';
import { IsEnum } from 'class-validator';
import { ContentStatus } from '~/common/constant/content-status-enum';

/* ------------------------------------------------------ */
/*                    TipTap Document                     */
/* ------------------------------------------------------ */
@modelOptions({ schemaOptions: { _id: false } })
class TipTapDocument {
  @prop({ required: true, type: () => Object, _id: false })
  content: Record<string, any>;
}

/* ------------------------------------------------------ */
/*                    Content Information                 */
/* ------------------------------------------------------ */
@modelOptions({ schemaOptions: { _id: false } })
export class ContentInfo {
  @prop({ required: true })
  title: string;

  @prop({ type: () => TipTapDocument, required: true })
  document: TipTapDocument;

  @prop()
  description?: string;
}

/* ------------------------------------------------------ */
/*                    Content Entity                      */
/* ------------------------------------------------------ */
@index({ 'en.title': 'text', 'kh.title': 'text' })
export class Content {
  @prop({ type: () => ContentInfo })
  en?: ContentInfo;

  @prop({ type: () => ContentInfo })
  kh?: ContentInfo;


  @prop()
  category?: string;

  @prop({
    type: () => [Types.ObjectId],
    required: true
  })
  tags: Types.ObjectId[];

  @prop({ default: Date.now })
  created_at: Date;

  @prop({ default: Date.now })
  updated_at: Date;

  @prop({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
    type: String
  })
  status: ContentStatus;

  @prop()
  createdBy: Ref<Admin>;

  @prop({ default: null })
  deleted_at: Date | null;
}

export const ContentModel = getModelForClass(Content);