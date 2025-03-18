import { prop, modelOptions, getModelForClass, index } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { _id: false } })
class SponsorInfo {
  @prop({ required: true }) 
  name: string;
  
  @prop({ required: true }) 
  description: string;
  
  @prop({ required: true }) 
  imageUrl: string;
}

@index({ "en.name": 1 }, { unique: true })
@index({ "kh.name": 1 }, { unique: true })
class Sponsor {
  @prop({ required: true, type: () => SponsorInfo }) 
  en: SponsorInfo;
  
  @prop({ required: true, type: () => SponsorInfo }) 
  kh: SponsorInfo;
  
  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
  
  @prop() 
  deleted_at: Date;
}

export const SponsorModel = getModelForClass(Sponsor);
export { SponsorInfo };