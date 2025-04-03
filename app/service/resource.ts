import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { ResourceModel } from "../entity/resource";
import { CombinedQueryDto, CreateResourcePayload, EditResourcePayload, ResourceQueryDto } from '../dto/resource';
import { MinistryModel } from '../entity/ministry';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';
import { ContentModel } from '../entity/blog';
import redis from '~/database/redis';

export class ResourceService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_RESOURCES: 'resources:all',
    RESOURCE_BY_ID: (id: string) => `resource:${id}`,
    RESOURCES_QUERY: (params: string) => `resources:query:${params}`,
    COMBINED_QUERY: (params: string) => `resources:combined:${params}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    RESOURCES: 3600, // 1 hour
    SINGLE_RESOURCE: 3600, // 1 hour
    QUERIES: 1800 // 30 minutes for queries since they might change more often
  };

  /**
   * Create a new resource
   * @param payload Resource creation data
   * @returns Newly created resource
   */
  async createResource(payload: CreateResourcePayload) {
    const ministryExists = await MinistryModel.exists({ _id: payload.source });
    if (!ministryExists) {
      throw notFound("Source ministry not found");
    }

    const resource = await ResourceModel.create({
      title: payload.title,
      lang: payload.lang,
      cover: payload.cover,
      file: payload.file,
      type: payload.type,
      publishedAt: new Date(payload.publishedAt),
      source: payload.source,
      created_at: new Date(),
      updated_at: new Date()
    });

    const populatedResource = await resource.populate('source');

    // Invalidate caches
    await this.invalidateResourceCaches();

    return populatedResource;
  }

  /**
   * Alternative implementation - for more efficient pagination with large datasets
   * using MongoDB's aggregation pipeline
   */
  async getCombinedItems(params: CombinedQueryDto) {
    // Create a cache key based on query parameters
    const cacheKey = this.CACHE_KEYS.COMBINED_QUERY(JSON.stringify(params));

    return await redis.getWithFallback(
      cacheKey,
      async () => {
        const {
          page = 1,
          limit = 10,
          year,
          search,
          keyword,
          category,
          type,
          tag,
          lang,
          source,
          status,
          sortBy = 'created_at',
          sortOrder = 'desc',
          includeDeleted = false
        } = params;

        // Common match conditions
        const searchTerm = keyword || '';
        // Convert string ids to ObjectId
        const tagId = tag ? new Types.ObjectId(tag) : null;
        const sourceId = source ? new Types.ObjectId(source) : null;

        // Content pipeline - exclude document fields but keep full object
        const contentPipeline = [
          {
            $match: {
              status: 'published',
              ...(includeDeleted ? {} : { deleted_at: null }),
              ...(category ? { category } : {}),
              ...(tagId ? { tags: { $in: [tagId] } } : {}),
              ...(sourceId ? { source: sourceId } : {}),
              ...(searchTerm ? {
                $or: [
                  { 'en.title': { $regex: searchTerm, $options: 'i' } },
                  { 'kh.title': { $regex: searchTerm, $options: 'i' } }
                ]
              } : {}),
              ...(year ? {
                created_at: {
                  $gte: new Date(Number(year), 0, 1),
                  $lte: new Date(Number(year), 11, 31, 23, 59, 59, 999)
                }
              } : {})
            }
          },
          {
            $lookup: {
              from: 'tags',
              localField: 'tags',
              foreignField: '_id',
              as: 'tags'
            }
          },
          {
            $lookup: {
              from: 'ministries', // Adjust collection name if needed
              localField: 'source',
              foreignField: '_id',
              as: 'sourceArray'
            }
          },
          // First create a clean version without the document field
          {
            $addFields: {
              clean: {
                _id: "$_id",
                en: {
                  title: "$en.title",
                  description: "$en.description",
                  thumbnailUrl: "$en.thumbnailUrl"
                  // Explicitly omitting document
                },
                kh: {
                  title: "$kh.title",
                  description: "$kh.description",
                  thumbnailUrl: "$kh.thumbnailUrl"
                  // Explicitly omitting document
                },
                category: "$category",
                tags: "$tags",
                tagObjects: "$tagObjects",
                source: { $arrayElemAt: ["$sourceArray", 0] },
                created_at: "$created_at",
                updated_at: "$updated_at",
                status: "$status",
                // Include any other fields you need
              }
            }
          },
          // Then project the result with the required format
          {
            $project: {
              _id: 1,
              title: { $ifNull: ["$en.title", "$kh.title"] },
              description: { $ifNull: ["$en.description", "$kh.description"] },
              thumbnailUrl: { $ifNull: ["$en.thumbnailUrl", "$kh.thumbnailUrl"] },
              category: 1,
              status: 1,
              contentType: { $literal: "content" },
              created_at: 1,
              updated_at: 1,
              originalItem: "$clean" // Store the clean version as originalItem
            }
          }
        ];

        // Resource pipeline with originalItem preserved
        const resourcePipeline = [
          {
            $match: {
              ...(type ? { type } : {}),
              ...(lang ? { lang } : {}),
              ...(sourceId ? { source: sourceId } : {}),
              ...(searchTerm ? { title: { $regex: searchTerm, $options: 'i' } } : {}),
              ...(year ? {
                publishedAt: {
                  $gte: new Date(Number(year), 0, 1),
                  $lte: new Date(Number(year), 11, 31, 23, 59, 59, 999)
                }
              } : {})
            }
          },
          {
            $lookup: {
              from: 'ministries',
              localField: 'source',
              foreignField: '_id',
              as: 'sourceArray'
            }
          },
          {
            $addFields: {
              clean: {
                _id: "$_id",
                title: "$title",
                description: "$description",
                thumbnailUrl: "$thumbnailUrl",
                type: "$type",
                file: "$file",
                cover: "$cover",
                lang: "$lang",
                publishedAt: "$publishedAt",
                source: { $arrayElemAt: ["$sourceArray", 0] },
                created_at: "$created_at",
                updated_at: "$updated_at"
                // Include any other fields you need
              }
            }
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnailUrl: 1,
              type: 1,
              publishedAt: 1,
              created_at: 1,
              updated_at: 1,
              contentType: { $literal: "resource" },
              originalItem: "$clean"
            }
          }
        ];

        // Execute both aggregations in parallel
        const [contentItems, resourceItems] = await Promise.all([
          ContentModel.aggregate(contentPipeline),
          ResourceModel.aggregate(resourcePipeline)
        ]);

        // Combine results
        const combinedResults = [...contentItems, ...resourceItems];

        // Determine sort field and direction
        let sortField = sortBy || 'created_at';
        const sortDirection = sortOrder?.toUpperCase() === 'ASC' ? 1 : -1;

        // Handle special sorting cases
        if (sortField === 'publishedAt') {
          // Create a function to determine the appropriate date to sort by
          combinedResults.forEach(item => {
            item.sortDate = item.publishedAt || item.created_at;
          });
          sortField = 'sortDate';
        }

        // Sort combined results
        const sortedResults = combinedResults.sort((a, b) => {
          let valueA = a[sortField];
          let valueB = b[sortField];

          // Handle title sorting with localeCompare
          if (sortField === 'title') {
            valueA = valueA || '';
            valueB = valueB || '';
            return sortDirection * valueA.localeCompare(valueB);
          }

          // Handle null/undefined values
          if (valueA === undefined || valueA === null) return 1;
          if (valueB === undefined || valueB === null) return -1;
          if (valueA === undefined && valueB === undefined) return 0;

          // Handle date comparison
          if (valueA instanceof Date && valueB instanceof Date) {
            return sortDirection * (valueA.getTime() - valueB.getTime());
          }

          // Default comparison
          return sortDirection * (valueA < valueB ? -1 : valueA > valueB ? 1 : 0);
        });

        // Apply pagination
        const totalCount = sortedResults.length;
        const skip = (page - 1) * limit;
        const paginatedResults = sortedResults.slice(skip, skip + limit);

        // Return results with pagination metadata
        return {
          results: paginatedResults,
          meta: {
            items_per_page: limit,
            current_page: page,
            total_count: totalCount,
            total_pages: Math.max(Math.ceil(totalCount / limit), 1)
          }
        };
      },
      this.CACHE_DURATIONS.QUERIES
    );
  }

  async getResources(queryDto: ResourceQueryDto) {
    // Create a cache key based on query parameters
    const cacheKey = this.CACHE_KEYS.RESOURCES_QUERY(JSON.stringify(queryDto));

    return await redis.getWithFallback(
      cacheKey,
      async () => {
        const {
          page = 1,
          limit = 10,
          type,
          lang,
          year,
          keyword,
          source,
          sortBy = 'publishedAt',
          sortOrder = 'desc'
        } = queryDto;

        const filter: any = {};

        if (type) filter.type = type;
        if (lang) filter.lang = lang;
        if (source) filter.source = source;

        if (keyword) {
          filter.title = { $regex: keyword, $options: 'i' };
        }

        if (year) {
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

          filter.publishedAt = {
            $gte: startDate,
            $lte: endDate
          };
        }

        const order_by = `${sortBy} ${sortOrder.toUpperCase()}`;

        const allowed_order = ['publishedAt', 'title', 'created_at', 'type', 'lang'];

        const paginationOptions: MongoPaginationOptions = {
          page,
          limit,
          order_by,
          allowed_order,
          filter,
          populate: 'source'
        };

        return await mongoPaginate(ResourceModel, paginationOptions);
      },
      this.CACHE_DURATIONS.QUERIES
    );
  }

  /**
   * Get a resource by ID
   * @param id Resource ID
   * @returns Resource document
   */
  async getResourceById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid resource ID format");
    }

    return await redis.getWithFallback(
      this.CACHE_KEYS.RESOURCE_BY_ID(id),
      async () => {
        const resource = await ResourceModel.findById(id).populate('source');

        if (!resource) {
          throw notFound("Resource not found");
        }

        return resource;
      },
      this.CACHE_DURATIONS.SINGLE_RESOURCE
    );
  }

  /**
   * Update a resource by ID
   * @param payload Resource update data with ID
   * @returns Updated resource
   */
  async updateResource(payload: EditResourcePayload) {
    const { id, ...updateData } = payload;

    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid resource ID format");
    }

    const ministryExists = await MinistryModel.exists({ _id: updateData.source });
    if (!ministryExists) {
      throw notFound("Source ministry not found");
    }

    const resource = await ResourceModel.findById(id);

    if (!resource) {
      throw notFound("Resource not found");
    }

    // Update fields
    Object.assign(resource, {
      ...updateData,
      publishedAt: new Date(updateData.publishedAt),
      updated_at: new Date()
    });

    const updatedResource = await resource.save().then(r => r.populate('source'));

    // Invalidate caches after update
    await this.invalidateResourceCaches(id);

    return updatedResource;
  }

  /**
   * Delete a resource permanently
   * @param id Resource ID
   * @returns Deletion result
   */
  async deleteResource(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid resource ID format");
    }

    const result = await ResourceModel.findOneAndDelete({ _id: id });

    if (!result) {
      throw notFound("Resource not found");
    }

    // Invalidate caches after deletion
    await this.invalidateResourceCaches(id);

    return result;
  }

  /**
   * Invalidate resource-related caches
   * @param resourceId Optional specific resource ID to invalidate
   */
  private async invalidateResourceCaches(resourceId?: string) {
    const deletePromises = [
      // Always invalidate query caches
      redis.delWildcard(this.CACHE_KEYS.RESOURCES_QUERY('*')),
      redis.delWildcard(this.CACHE_KEYS.COMBINED_QUERY('*'))
    ];

    // If a specific resource ID was provided, also invalidate that resource's cache
    if (resourceId) {
      deletePromises.push(redis.del(this.CACHE_KEYS.RESOURCE_BY_ID(resourceId)));
    }

    await Promise.all(deletePromises);
  }

  /**
   * Clear all resource-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllResourceCaches() {
    await Promise.all([
      redis.delWildcard('resource:*'),
      redis.delWildcard(this.CACHE_KEYS.RESOURCES_QUERY('*')),
      redis.delWildcard(this.CACHE_KEYS.COMBINED_QUERY('*'))
    ]);
  }
}