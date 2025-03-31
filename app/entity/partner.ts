import { index, prop, getModelForClass } from "@typegoose/typegoose";

/* ------------------------------------------------------ */
/*                    Partner Info                        */
/* ------------------------------------------------------ */
export class PartnerInfo {
  @prop({ required: true })
  name: string;

  @prop({ required: true })
  description: string;

  @prop({ required: true })
  lang: string;
}

/* ------------------------------------------------------ */
/*                    Partner Entity                      */
/* ------------------------------------------------------ */
@index({ 'en.name': 'text', 'kh.name': 'text' })
export class CollabPartner {
  @prop({ type: () => PartnerInfo })
  en?: PartnerInfo;

  @prop({ type: () => PartnerInfo })
  kh?: PartnerInfo;

  @prop({ required: true })
  url: string;

  @prop({ required: true })
  logo: string;

  @prop({ default: Date.now })
  created_at: Date;

  @prop({ default: Date.now })
  updated_at: Date;

  @prop({ default: null })
  deleted_at: Date | null;
}

export const PartnerModel = getModelForClass(CollabPartner);