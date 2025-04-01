import { getModelForClass, index, prop } from "@typegoose/typegoose";
import { ContentInfo } from "./blog";

/* ------------------------------------------------------ */
/*                    Module Entity                       */
/* ------------------------------------------------------ */
@index({ 'en.title': 'text', 'kh.title': 'text' })
export class Module {
    @prop({ type: () => ContentInfo })
    en?: ContentInfo;

    @prop({ type: () => ContentInfo })
    kh?: ContentInfo;

    @prop({ required: true })
    mainCategory: string;

    @prop()
    subCategory: string;

    @prop({ required: true })
    cover: string;

    @prop({ default: Date.now })
    created_at: Date;

    @prop({ default: Date.now })
    updated_at: Date;

    @prop({ default: null })
    deleted_at: Date | null;
}

export const ModuleModel = getModelForClass(Module);