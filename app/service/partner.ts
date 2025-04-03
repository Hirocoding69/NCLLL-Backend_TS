import { Types } from 'mongoose';
import { notFound, unprocessableEntity } from "~/common/response";
import { PartnerModel } from "../entity/partner";
import { CreatePartnerPayload, EditPartnerPayload, PartnerQueryDto } from '../dto/partner';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';
import redis from '~/database/redis';

export class PartnerService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_PARTNERS: 'partners:all',
    PARTNER_BY_ID: (id: string) => `partner:${id}`,
    PARTNERS_QUERY: (params: string) => `partners:query:${params}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    PARTNERS: 3600, // 1 hour
    SINGLE_PARTNER: 3600, // 1 hour
    QUERIES: 1800 // 30 minutes for queries
  };

  /**
   * Create a new partner
   * @param payload Partner creation data
   * @returns Newly created partner
   */
  async createPartner(payload: CreatePartnerPayload) {
    const existingPartner = await PartnerModel.findOne({
      $or: [
        { en: { name: payload.en?.name } },
        { kh: { name: payload.kh?.name } }
      ]
    });
    if (existingPartner) {
      throw unprocessableEntity("message.partner_name_exists");
    }

    const newPartner = await PartnerModel.create({
      en: payload.en,
      kh: payload.kh,
      url: payload.url,
      logo: payload.logo,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Invalidate partner caches
    await this.invalidatePartnerCaches();

    return newPartner;
  }

  /**
   * Query partners with filtering, pagination and sorting
   * @param queryDto Query parameters
   * @returns Paginated partners and metadata
   */
  async getPartners(queryDto: PartnerQueryDto) {
    // Create a cache key based on query parameters
    const cacheKey = this.CACHE_KEYS.PARTNERS_QUERY(JSON.stringify(queryDto));

    return await redis.getWithFallback(
      cacheKey,
      async () => {
        const {
          page = 1,
          limit = 10,
          lang,
          search,
          sortBy = 'created_at',
          sortOrder = 'desc'
        } = queryDto;

        // Build filter object
        const filter: any = {
          deleted_at: null
        };

        // Language filter
        if (lang) {
          if (lang === 'en') {
            filter.en = { $exists: true };
          } else if (lang === 'kh') {
            filter.kh = { $exists: true };
          }
        }

        // Text search
        if (search) {
          filter.$text = { $search: search };
        }

        // Create order_by string
        const order_by = `${sortBy} ${sortOrder.toUpperCase()}`;

        // List of allowed sort fields
        const allowed_order = ['created_at', 'updated_at'];

        // Configure pagination options
        const paginationOptions: MongoPaginationOptions = {
          page,
          limit,
          order_by,
          allowed_order,
          filter
        };

        // Execute paginated query
        return await mongoPaginate(PartnerModel, paginationOptions);
      },
      this.CACHE_DURATIONS.QUERIES
    );
  }

  /**
   * Get a partner by ID
   * @param id Partner ID
   * @returns Partner document
   */
  async getPartnerById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid partner ID format");
    }

    return await redis.getWithFallback(
      this.CACHE_KEYS.PARTNER_BY_ID(id),
      async () => {
        const partner = await PartnerModel.findOne({
          _id: id,
          deleted_at: null
        });

        if (!partner) {
          throw notFound("Partner not found");
        }

        return partner;
      },
      this.CACHE_DURATIONS.SINGLE_PARTNER
    );
  }

  /**
   * Update a partner by ID
   * @param payload Partner update data with ID
   * @returns Updated partner
   */
  async updatePartner(payload: EditPartnerPayload) {
    const { id, ...updateData } = payload;

    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid partner ID format");
    }

    const partner = await PartnerModel.findOne({
      _id: id,
      deleted_at: null
    });

    if (!partner) {
      throw notFound("Partner not found");
    }

    // Update partner info
    if (updateData.en) {
      partner.en = {
        ...(partner.en as any),
        ...updateData.en
      };
    }

    if (updateData.kh) {
      partner.kh = {
        ...(partner.kh as any),
        ...updateData.kh
      };
    }

    // Update other fields
    if (updateData.url) partner.url = updateData.url;
    if (updateData.logo) partner.logo = updateData.logo;

    partner.updated_at = new Date();

    const updatedPartner = await partner.save();

    // Invalidate caches after update
    await this.invalidatePartnerCaches(id);

    return updatedPartner;
  }

  /**
   * Soft delete a partner
   * @param id Partner ID
   * @returns Deleted partner
   */
  async deletePartner(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid partner ID format");
    }

    const partner = await PartnerModel.findOne({
      _id: id,
      deleted_at: null
    });

    if (!partner) {
      throw notFound("Partner not found");
    }

    partner.deleted_at = new Date();
    partner.updated_at = new Date();

    const deletedPartner = await partner.save();

    // Invalidate caches after deletion
    await this.invalidatePartnerCaches(id);

    return deletedPartner;
  }

  /**
   * Permanently delete a partner
   * @param id Partner ID
   * @returns Deletion result
   */
  async permanentDeletePartner(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid partner ID format");
    }

    const result = await PartnerModel.findByIdAndDelete(id);

    if (!result) {
      throw notFound("Partner not found");
    }

    // Invalidate caches after permanent deletion
    await this.invalidatePartnerCaches(id);

    return result;
  }

  /**
   * Invalidate partner-related caches
   * @param partnerId Optional specific partner ID to invalidate
   */
  private async invalidatePartnerCaches(partnerId?: string) {
    const deletePromises = [
      // Always invalidate query caches
      redis.delWildcard(this.CACHE_KEYS.PARTNERS_QUERY('*'))
    ];

    // If a specific partner ID was provided, also invalidate that partner's cache
    if (partnerId) {
      deletePromises.push(redis.del(this.CACHE_KEYS.PARTNER_BY_ID(partnerId)));
    }

    await Promise.all(deletePromises);
  }

  /**
   * Clear all partner-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllPartnerCaches() {
    await Promise.all([
      redis.delWildcard('partner:*'),
      redis.delWildcard(this.CACHE_KEYS.PARTNERS_QUERY('*'))
    ]);
  }
}