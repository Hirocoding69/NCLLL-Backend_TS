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
    const ministryExists = await MinistryModel.exists({ _id: payload.source });
    if (!ministryExists) {
      throw notFound("Source ministry not found");
    }

    const resource =  await ResourceModel.create({
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
    return await resource.populate('source');
  }

  async getResources(queryDto: ResourceQueryDto) {
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

    return await resource.save().then(r => r.populate('source'));
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