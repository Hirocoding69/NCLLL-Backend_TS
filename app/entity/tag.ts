import { prop, modelOptions, getModelForClass, index } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { _id: false } })
class TagInfo {
  @prop({ required: true }) 
  name: string;

  @prop({ required: true }) 
  lang: string;
}

@index({ "en.name": 1 }, { unique: true })
@index({ "kh.name": 1 }, { unique: true })
class Tag {
  @prop({ required: true, type: () => TagInfo }) 
  en: TagInfo;
  
  @prop({ required: true, type: () => TagInfo }) 
  kh: TagInfo;
  
  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
  
}

export const TagModel = getModelForClass(Tag);
export { TagInfo };