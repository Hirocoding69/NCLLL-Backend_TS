import { prop, getModelForClass } from '@typegoose/typegoose';

class RequestPartners {

  @prop({ required: true }) 
  status: String;
  
  @prop({ required: true }) 
  email: String;

  @prop({ required: true }) 
  reason: String;

  @prop({ required: true }) 
  description: String;

  @prop() 
  created_at: Date;
  
  @prop() 
  updated_at: Date;
}

export const RequestPartnersModel = getModelForClass(RequestPartners);