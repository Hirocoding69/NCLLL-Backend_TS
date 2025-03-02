import { prop, getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';

export class Admin {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  email!: string;

  @prop({ required: true })
  password!: string;

  @prop({ required: true })
  role!: string;
}

export const AdminModel = getModelForClass(Admin);