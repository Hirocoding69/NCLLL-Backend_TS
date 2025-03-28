import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { CreateContentPayload, EditContentPayload, GetContentQueryParams } from '../dto/blog';
import { ContentModel } from '../entity/blog';
import { ContentStatus } from '~/common/constant/content-status-enum';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';

export class ContentService {
    /**
     * Create a new content with TipTap document
     * @param payload Content creation data
     * @returns Newly created content
     */
    async createContent(payload: CreateContentPayload) {
        const content: any = {
            ...payload,
            createdBy: payload.auth.name
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
  * @returns Paginated array of content items
  */
    async getAllContent(params?: GetContentQueryParams) {
        const {
            page = 1,
            limit = 10,
            category,
            status,
            tag,
            year,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc',
            includeDeleted = false
        } = params || {};

        const filter: any = {};

        if (!includeDeleted) {
            filter.deleted_at = null;
        }

        if (category) filter.category = category;
        if (status) filter.status = status;

        if (tag) {
            filter.tags = { $in: [new Types.ObjectId(tag)] };
        }

        if (search) {
            filter.$or = [
                { 'en.title': { $regex: search, $options: 'i' } },
                { 'kh.title': { $regex: search, $options: 'i' } }
            ];
        }

        if (year) {
            const startDate = new Date(Number(year), 0, 1);
            const endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);
            filter.created_at = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const order_by = `${sortBy} ${sortOrder.toUpperCase()}`;
        const allowed_order = ['created_at', 'updated_at', 'title', 'category', 'status'];

        const paginationOptions: MongoPaginationOptions = {
            page,
            limit,
            order_by,
            allowed_order,
            filter,
            populate: [{
                path: 'tags',
                model: 'Tag'
            },
            {
                path: 'source',
                model: 'Ministry'
            }],
            select: '-en.document -kh.document'
        };

        return await mongoPaginate(ContentModel, paginationOptions);
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

        if (updateData.category !== undefined) {
            content.category = updateData.category;
        }

        if (updateData.tags) {
            content.tags = updateData.tags.map(tagId => new Types.ObjectId(tagId));
        }

        if (updateData.status) {
            if (updateData.status) {
                content.status = updateData.status as ContentStatus;
            }
        }


        if (updateData.en) {
            content.en = {
                title: updateData.en.title || content.en!.title,
                document: updateData.en.document || content.en!.document,
                description: updateData.en.description || content.en!.description
            };
        }

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