import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { BaseSoftDeleteEntity } from './base';

class Address {
  @prop()
  houseNumber: string;

  @prop()
  street: string;

  @prop()
  district: string;

  @prop()
  city: string;

  @prop()
  country: string;
}

class CareerDetail {
  @prop()
  value: string;

  @prop()
  detail: string;
}

class Position  {
  @prop({ required: true, unique: true })
  title: string;

  @prop({ required: true })
  level: number;
}

@modelOptions({ schemaOptions: { _id: false } })
export class MemberInfo {

  @prop({ required: true })
  imageUrl: string;

  @prop({ required: true })
  birthDate: string;

  @prop({ required: true })
  email: string;

  @prop({ required: true })
  nationality: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, type: () => Address })
  placeOfBirth: Address;

  @prop({ required: true, type: () => Address })
  currentAddress: Address;

  @prop({ type: () => [CareerDetail] })
  careerStatus: CareerDetail[];

  @prop({ type: () => [CareerDetail] })
  experience: CareerDetail[];

  @prop({ required: true, type: () => Position })
  position: Position;
}

class Member  {
  @prop({ type: () => MemberInfo, required: true })
  en: MemberInfo;

  @prop({ type: () => MemberInfo, required: true })
  kh: MemberInfo;
}

export const MemberModel = getModelForClass(Member);
export const PositionModel = getModelForClass(Position);