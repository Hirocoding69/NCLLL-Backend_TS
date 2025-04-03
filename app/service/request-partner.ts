import { CreateRequestPartnerDTO } from '../dto/request-partner';
import { RequestPartnersModel } from '../entity/request-partners';
import redis from '~/database/redis';

export class RequestPartnerService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_REQUESTS: 'request-partners:all'
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    ALL_REQUESTS: 3600 // 1 hour
  };

  /**
   * Create a new partner request
   * @param payload Request partner creation data
   * @returns Newly created partner request
   */
  async create(payload: CreateRequestPartnerDTO) {
    const newRequest = await RequestPartnersModel.create({
      status: "pending",
      email: payload.email,
      reason: payload.reason,
      description: payload.description,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Invalidate the all requests cache since we've added a new one
    await redis.del(this.CACHE_KEYS.ALL_REQUESTS);

    return newRequest;
  }

  /**
   * Get all partner requests
   * @returns All partner requests
   */
  async getAll() {
    return await redis.getWithFallback(
      this.CACHE_KEYS.ALL_REQUESTS,
      async () => {
        return await RequestPartnersModel.find();
      },
      this.CACHE_DURATIONS.ALL_REQUESTS
    );
  }

  /**
   * Clear all request-partner related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllRequestPartnerCaches() {
    await redis.del(this.CACHE_KEYS.ALL_REQUESTS);
  }
}