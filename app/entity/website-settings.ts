import { prop, modelOptions, getModelForClass, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
})
class WebsiteSettings {
  @prop({ required: true, type: () => Boolean })
  maintenanceMode : Boolean = false;
  
  @prop() 
  created_at: Date = new Date();
  
  @prop() 
  updated_at: Date = new Date();
}

export const WebsiteSettingsModel = getModelForClass(WebsiteSettings);