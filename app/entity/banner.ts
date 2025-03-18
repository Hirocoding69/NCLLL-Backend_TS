import { prop, modelOptions, getModelForClass, index } from '@typegoose/typegoose';

@index({ "title": 1 }, { unique: true })
class Banner {
  @prop({ required: true }) 
  title: string;
  
  @prop({ required: true }) 
  imageUrl: string;
  
  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
  
  @prop() 
  deleted_at: Date;
}

export const BannerModel = getModelForClass(Banner);