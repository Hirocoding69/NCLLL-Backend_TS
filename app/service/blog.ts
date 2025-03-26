import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { CreateContentPayload, EditContentPayload, GetContentQueryParams } from '../dto/blog';
import { ContentModel } from '../entity/blog';

export class ContentService {
    /**
     * Create a new content with TipTap document
     * @param payload Content creation data
     * @returns Newly created content
     */
    async createContent(payload: CreateContentPayload) {
        // Convert parentId string to ObjectId if provided
        const parentId = payload.parentId ? new Types.ObjectId(payload.parentId) : null;
        const content: any = {
        };
        if (payload.en) {
            content.en = {
                title: payload.en.title,
                document: payload.en.document,
                description: payload.en.description
            };
        }
        if (payload.kh) {
            content.kh = {
                title: payload.kh.title,
                document: payload.kh.document,
                description: payload.kh.description
            };
        }
        return await ContentModel.create(content);
    }

    /**
     * Get all active content items, with optional filtering
     * @param params Optional query parameters for filtering
     * @returns Array of content items
     */
    async getAllContent(params?: GetContentQueryParams) {
        const query: any = { deleted_at: null };

        // Add category filter if provided
        if (params?.category) {
            query.category = params.category;
        }

        // Add parent filter if provided
        if (params?.parentId) {
            query.parentId = new Types.ObjectId(params.parentId);
        }

        return await ContentModel.find(query)
            .sort({ 'created_at': -1 })
            .exec();
    }

    /**
     * Get content by ID
     * @param id Content ID
     * @returns Content document
     */
    async getContentById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid content ID format");
        }

        const content = await ContentModel.findOne({
            _id: id,
            deleted_at: null
        });

        if (!content) {
            throw notFound("Content not found");
        }

        return content;
    }

    /**
     * Update content by ID
     * @param payload Content update data with ID
     * @returns Updated content
     */
    async updateContent(payload: EditContentPayload) {
        const { id, ...updateData } = payload;

        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid content ID format");
        }

        const content = await ContentModel.findOne({
            _id: id,
            deleted_at: null
        });

        if (!content) {
            throw notFound("Content not found");
        }

        // Convert parentId string to ObjectId if provided
        if (updateData.parentId) {
            content.parentId = new Types.ObjectId(updateData.parentId);
        }

        // Update category if provided
        if (updateData.category !== undefined) {
            content.category = updateData.category;
        }

        // Update English content info
        if (updateData.en) {
            content.en = {
                title: updateData.en.title || content.en!.title,
                document: updateData.en.document || content.en!.document,
                description: updateData.en.description || content.en!.description
            };
        }

        // Update Khmer content info
        if (updateData.kh) {
            content.kh = {
                title: updateData.kh.title || content.kh!.title,
                document: updateData.kh.document || content.kh!.document,
                description: updateData.kh.description || content.kh!.description
            };
        }

        content.updated_at = new Date();

        return await content.save();
    }

    /**
     * Soft delete content by setting deleted_at timestamp
     * @param id Content ID
     */
    async softDeleteContent(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid content ID format");
        }

        const content = await ContentModel.findOne({
            _id: id,
            deleted_at: null
        });

        if (!content) {
            throw notFound("Content not found");
        }

        content.deleted_at = new Date();
        await content.save();

        return content;
    }

    /**
     * Hard delete content from database
     * @param id Content ID
     */
    async hardDeleteContent(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid content ID format");
        }

        await ContentModel.findOneAndDelete({ _id: id });
    }

    /**
     * Search content by title in both languages
     * @param query Search query string
     * @returns Array of matching content items
     */
    async searchContent(query: string) {
        return await ContentModel.find({
            $text: { $search: query },
            deleted_at: null
        })
            .sort({ score: { $meta: "textScore" } })
            .exec();
    }
}