import { prop } from '@typegoose/typegoose';

export class BaseEntity {
  @prop({ required: true, default: () => new Date() })
  created_at: Date;

  @prop({ required: true, default: () => new Date() })
  updated_at: Date;
}

export class BasedeleteEntity extends BaseEntity {
  @prop({ required: false, default: null })
  deleted_at: Date | null;
}