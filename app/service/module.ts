import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { ModuleModel } from "../entity/module";
import { CreateModulePayload, EditModulePayload, ModuleQueryDto } from '../dto/module';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';
import redis from '~/database/redis';

export class ModuleService {
    // Redis cache keys
    private readonly CACHE_KEYS = {
        MODULE_BY_ID: (id: string) => `module:${id}`,
        MODULES_QUERY: (params: string) => `modules:query:${params}`,
        MAIN_CATEGORIES: 'modules:main-categories',
        SUB_CATEGORIES: (mainCategory: string) => `modules:sub-categories:${mainCategory}`
    };

    // Cache durations (in seconds)
    private readonly CACHE_DURATIONS = {
        MODULE: 3600, // 1 hour
        QUERIES: 1800, // 30 minutes
        CATEGORIES: 7200 // 2 hours (categories change less frequently)
    };

    /**
     * Create a new module
     * @param payload Module creation data
     * @returns Newly created module
     */
    async createModule(payload: CreateModulePayload) {
        const newModule = await ModuleModel.create({
            en: payload.en,
            kh: payload.kh,
            mainCategory: payload.mainCategory,
            subCategory: payload.subCategory,
            cover: payload.cover,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Invalidate relevant caches
        await this.invalidateModuleCaches(undefined, payload.mainCategory);

        return newModule;
    }

    /**
     * Query modules with filtering, pagination and sorting
     * @param queryDto Query parameters
     * @returns Paginated modules and metadata
     */
    async getModules(queryDto: ModuleQueryDto) {
        // Create a cache key based on query parameters
        const cacheKey = this.CACHE_KEYS.MODULES_QUERY(JSON.stringify(queryDto));

        return await redis.getWithFallback(
            cacheKey,
            async () => {
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
                filter.subCategory = subCategory;

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
            },
            this.CACHE_DURATIONS.QUERIES
        );
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

        return await redis.getWithFallback(
            this.CACHE_KEYS.MODULE_BY_ID(id),
            async () => {
                const module = await ModuleModel.findOne({
                    _id: id,
                    deleted_at: null
                });

                if (!module) {
                    throw notFound("Module not found");
                }

                return module;
            },
            this.CACHE_DURATIONS.MODULE
        );
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

        // Store the original main category to check if it changed
        const originalMainCategory = module.mainCategory;

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

        const updatedModule = await module.save();

        // Check if main category changed, invalidate both old and new category caches
        if (originalMainCategory !== module.mainCategory) {
            await this.invalidateModuleCaches(id, originalMainCategory, module.mainCategory);
        } else {
            await this.invalidateModuleCaches(id, module.mainCategory);
        }

        return updatedModule;
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

        // Store main category before deleting to invalidate related caches
        const mainCategory = module.mainCategory;

        module.deleted_at = new Date();
        module.updated_at = new Date();

        const deletedModule = await module.save();

        // Invalidate caches after deletion
        await this.invalidateModuleCaches(id, mainCategory);

        return deletedModule;
    }

    /**
     * Get distinct main categories
     * @returns Array of distinct main categories
     */
    async getMainCategories() {
        return await redis.getWithFallback(
            this.CACHE_KEYS.MAIN_CATEGORIES,
            async () => {
                return await ModuleModel.distinct('mainCategory', { deleted_at: null });
            },
            this.CACHE_DURATIONS.CATEGORIES
        );
    }

    /**
     * Get sub categories for a specific main category
     * @param mainCategory The main category to filter by
     * @returns Array of distinct sub categories for the given main category
     */
    async getSubCategories(mainCategory: string) {
        return await redis.getWithFallback(
            this.CACHE_KEYS.SUB_CATEGORIES(mainCategory),
            async () => {
                return await ModuleModel.distinct('subCategory', {
                    mainCategory,
                    deleted_at: null
                });
            },
            this.CACHE_DURATIONS.CATEGORIES
        );
    }

    /**
     * Invalidate module-related caches
     * @param moduleId Optional specific module ID to invalidate
     * @param mainCategories Main categories to invalidate (can be multiple)
     */
    private async invalidateModuleCaches(moduleId?: string, ...mainCategories: string[]) {
        const deletePromises = [
            // Always invalidate query caches
            redis.delWildcard(this.CACHE_KEYS.MODULES_QUERY('*')),
            // Always invalidate main categories
            redis.del(this.CACHE_KEYS.MAIN_CATEGORIES)
        ];

        // If a specific module ID was provided, also invalidate that module's cache
        if (moduleId) {
            deletePromises.push(redis.del(this.CACHE_KEYS.MODULE_BY_ID(moduleId)));
        }

        // If main categories were provided, invalidate their sub-category caches
        if (mainCategories && mainCategories.length > 0) {
            mainCategories.forEach(category => {
                if (category) {
                    deletePromises.push(redis.del(this.CACHE_KEYS.SUB_CATEGORIES(category)));
                }
            });
        }

        await Promise.all(deletePromises);
    }

    /**
     * Clear all module-related caches
     * This can be useful for admin operations or when doing bulk updates
     */
    async clearAllModuleCaches() {
        await Promise.all([
            redis.delWildcard('module:*'),
            redis.delWildcard(this.CACHE_KEYS.MODULES_QUERY('*')),
            redis.delWildcard('modules:sub-categories:*'),
            redis.del(this.CACHE_KEYS.MAIN_CATEGORIES)
        ]);
    }
}