import { prop, modelOptions, getModelForClass, Ref, index } from '@typegoose/typegoose';

class Address {
  @prop() houseNumber: string;
  @prop() street: string;
  @prop() district: string;
  @prop() city: string;
  @prop() country: string;
}

class CareerDetail {
  @prop() value: string;
  @prop() detail: string;
}
@modelOptions({ schemaOptions: { _id: false } })
class PositionInfo {
  @prop({ required: true }) title: string;
  @prop({ required: true }) level: number;
}

@index({ "en.title": 1, "en.level": 1 }, { unique: true })
@index({ "kh.title": 1, "kh.level": 1 }, { unique: true })
class Position {
  @prop({ required: true, type: () => PositionInfo }) en: PositionInfo;
  @prop({ required: true, type: () => PositionInfo }) kh: PositionInfo;
}
@modelOptions({ schemaOptions: { _id: false } })
export class MemberInfo {
  @prop({ required: true }) imageUrl: string;
  @prop({ required: true }) birthDate: string;
  @prop({ required: true }) email: string;
  @prop({ required: true }) nationality: string;
  @prop({ required: true }) name: string;
  @prop({ required: true, type: () => Address }) placeOfBirth: Address;
  @prop({ required: true, type: () => Address }) currentAddress: Address;
  @prop({ type: () => [CareerDetail] }) careerStatus: CareerDetail[];
  @prop({ type: () => [CareerDetail] }) experience: CareerDetail[];
}

class Member {
  @prop({ required: true, type: () => MemberInfo }) en: MemberInfo;
  @prop({ required: true, type: () => MemberInfo }) kh: MemberInfo;
  @prop({ required: true, ref: () => Position }) position: Ref<Position>;
}

export const MemberModel = getModelForClass(Member);
export const PositionModel = getModelForClass(Position);
