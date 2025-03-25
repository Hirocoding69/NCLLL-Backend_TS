import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { ResourceModel } from "../entity/resource";
import { CreateResourcePayload, EditResourcePayload, ResourceQueryDto } from '../dto/resource';
import { MinistryModel } from '../entity/ministry';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';

export class ResourceService {
  /**
   * Create a new resource
   * @param payload Resource creation data
   * @returns Newly created resource
   */
  async createResource(payload: CreateResourcePayload) {
    // Verify ministry exists
    const ministryExists = await MinistryModel.exists({ _id: payload.source });
    if (!ministryExists) {
      throw notFound("Source ministry not found");
    }

    return await ResourceModel.create({
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
  }

  async getResources(queryDto: ResourceQueryDto) {
    const {
      page = 1,
      limit = 10,
      type,
      lang,
      year,
      source,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = queryDto;

    // Build filter object
    const filter: any = {};

    if (type) filter.type = type;
    if (lang) filter.lang = lang;
    if (source) filter.source = source;

    // If year is provided, filter by date range
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      filter.publishedAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Create order_by string from sortBy and sortOrder
    const order_by = `${sortBy} ${sortOrder.toUpperCase()}`;

    // List of allowed sort fields
    const allowed_order = ['publishedAt', 'title', 'created_at', 'type', 'lang'];

    // Configure pagination options
    const paginationOptions: MongoPaginationOptions = {
      page,
      limit,
      order_by,
      allowed_order,
      filter,
      populate: 'source'
    };

    // Execute paginated query
    return await mongoPaginate(ResourceModel, paginationOptions);
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

    const resource = await ResourceModel.findById(id).populate('source');

    if (!resource) {
      throw notFound("Resource not found");
    }

    return resource;
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

    // Verify ministry exists
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

    return await resource.save();
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

    return result;
  }
}