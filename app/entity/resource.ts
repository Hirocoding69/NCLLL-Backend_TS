import { prop, modelOptions, getModelForClass, index, Ref } from '@typegoose/typegoose';
import { Ministry } from './ministry';

@index({ "title": 1, "lang": 1 }, { unique: true })
class Resource {
  @prop({ required: true }) 
  title: string;
  
  @prop({ required: true }) 
  lang: string;
  
  @prop({ required: true }) 
  cover: string;
  
  @prop({ required: true }) 
  file: string;
  
  @prop({ required: true })
  type: string;
  
  @prop({ required: true })
  publishedAt: Date;
  
  @prop({ ref: () => Ministry, required: true })
  source: Ref<Ministry>;
  
  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
}

export const ResourceModel = getModelForClass(Resource);