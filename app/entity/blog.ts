import { prop, modelOptions, getModelForClass, Ref, index } from '@typegoose/typegoose';
import { Types } from 'mongoose';

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
  
  @prop({  type: () => ContentInfo })
  kh?: ContentInfo;
  
  @prop({ type: () => Types.ObjectId, default: null })
  parentId?: Types.ObjectId | null;
  
  @prop()
  category?: string;
  
  @prop({ default: Date.now })
  created_at: Date;
  
  @prop({ default: Date.now })
  updated_at: Date;
  
  @prop({ default: null })
  deleted_at: Date | null;
}

export const ContentModel = getModelForClass(Content);