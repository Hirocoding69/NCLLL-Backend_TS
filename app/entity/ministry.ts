import { prop, modelOptions, getModelForClass, index } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { _id: false } })
class MinistryInfo {
  @prop({ required: true }) 
  name: string;

  @prop({ required: true }) 
  imageUrl: string;
}

@index({ "en.name": 1 }, { unique: true })
@index({ "kh.name": 1 }, { unique: true })
export class Ministry {
  @prop({ required: true, type: () => MinistryInfo }) 
  en: MinistryInfo;
  
  @prop({ required: true, type: () => MinistryInfo }) 
  kh: MinistryInfo;
  
  @prop()
  deleted_at: Date;

  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
}

export const MinistryModel = getModelForClass(Ministry);
export { MinistryInfo };