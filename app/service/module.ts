import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { ModuleModel } from "../entity/module";
import { CreateModulePayload, EditModulePayload, ModuleQueryDto } from '../dto/module';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';

export class ModuleService {
    /**
     * Create a new module
     * @param payload Module creation data
     * @returns Newly created module
     */
    async createModule(payload: CreateModulePayload) {
        return await ModuleModel.create({
            en: payload.en,
            kh: payload.kh,
            mainCategory: payload.mainCategory,
            subCategory: payload.subCategory,
            cover: payload.cover,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    /**
     * Query modules with filtering, pagination and sorting
     * @param queryDto Query parameters
     * @returns Paginated modules and metadata
     */
    async getModules(queryDto: ModuleQueryDto) {
        const {
            page = 1,
            limit = 10,
            mainCategory,
            subCategory,
            lang,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = queryDto;

        const filter: any = {
            deleted_at: null
        };

        if (mainCategory) filter.mainCategory = mainCategory;
        if (subCategory) filter.subCategory = subCategory;

        if (lang) {
            if (lang === 'en') {
                filter.en = { $exists: true };
            } else if (lang === 'kh') {
                filter.kh = { $exists: true };
            }
        }

        if (search) {
            filter.$text = { $search: search };
        }

        const order_by = `${sortBy} ${sortOrder.toUpperCase()}`;

        const allowed_order = ['created_at', 'updated_at', 'mainCategory', 'subCategory'];
        const paginationOptions: MongoPaginationOptions = {
            page,
            limit,
            order_by,
            allowed_order,
            filter,
            select: '-en.document -kh.document -deleted_at -__v'
        };

        return await mongoPaginate(ModuleModel, paginationOptions);
    }

    /**
     * Get a module by ID
     * @param id Module ID
     * @returns Module document
     */
    async getModuleById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid module ID format");
        }

        const module = await ModuleModel.findOne({
            _id: id,
            deleted_at: null
        });

        if (!module) {
            throw notFound("Module not found");
        }

        return module;
    }

    /**
     * Update a module by ID
     * @param payload Module update data with ID
     * @returns Updated module
     */
    async updateModule(payload: EditModulePayload) {
        const { id, ...updateData } = payload;

        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid module ID format");
        }

        const module = await ModuleModel.findOne({
            _id: id,
            deleted_at: null
        });

        if (!module) {
            throw notFound("Module not found");
        }

        // Update module info
        if (updateData.en) {
            module.en = {
                ...(module.en as any),
                ...updateData.en
            };
        }

        if (updateData.kh) {
            module.kh = {
                ...(module.kh as any),
                ...updateData.kh
            };
        }

        // Update other fields
        if (updateData.mainCategory) module.mainCategory = updateData.mainCategory;
        module.subCategory = updateData.subCategory;
        if (updateData.cover) module.cover = updateData.cover;

        module.updated_at = new Date();

        return await module.save();
    }

    /**
     * Soft delete a module
     * @param id Module ID
     * @returns Deleted module
     */
    async deleteModule(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw notFound("Invalid module ID format");
        }

        const module = await ModuleModel.findOne({
            _id: id,
            deleted_at: null
        });

        if (!module) {
            throw notFound("Module not found");
        }

        module.deleted_at = new Date();
        module.updated_at = new Date();

        return await module.save();
    }

    /**
     * Get distinct main categories
     * @returns Array of distinct main categories
     */
    async getMainCategories() {
        return await ModuleModel.distinct('mainCategory', { deleted_at: null });
    }

    /**
     * Get sub categories for a specific main category
     * @param mainCategory The main category to filter by
     * @returns Array of distinct sub categories for the given main category
     */
    async getSubCategories(mainCategory: string) {
        return await ModuleModel.distinct('subCategory', {
            mainCategory,
            deleted_at: null
        });
    }
}