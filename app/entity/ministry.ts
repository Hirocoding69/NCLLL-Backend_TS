import { prop, modelOptions, getModelForClass, index } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { _id: false } })
class MinistryInfo {
  @prop({ required: true }) 
  name: string;

  @prop({ required: true }) 
  lang: string;
}

@index({ "en.name": 1 }, { unique: true })
@index({ "kh.name": 1 }, { unique: true })
class Ministry {
  @prop({ required: true, type: () => MinistryInfo }) 
  en: MinistryInfo;
  
  @prop({ required: true, type: () => MinistryInfo }) 
  kh: MinistryInfo;
  
  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
}

export const MinistryModel = getModelForClass(Ministry);
export { MinistryInfo };