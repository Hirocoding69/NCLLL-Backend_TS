/* ------------------------------------------------------ */
/*                    Content Entity                      */

import { index, prop } from "@typegoose/typegoose";
import { ContentInfo } from "./blog";

/* ------------------------------------------------------ */
@index({ 'en.title': 'text', 'kh.title': 'text' })
export class Content {
  @prop({ type: () => ContentInfo })
  en?: ContentInfo;

  @prop({ type: () => ContentInfo })
  kh?: ContentInfo;

  @prop()
  category?: string;

  @prop({ required: true })
  cover: string;

  @prop({ default: Date.now })
  created_at: Date;

  @prop({ default: Date.now })
  updated_at: Date;

  @prop({ default: null })
  deleted_at: Date | null;
}