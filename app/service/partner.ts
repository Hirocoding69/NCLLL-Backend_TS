import { Types } from 'mongoose';
import { notFound, unprocessableEntity } from "~/common/response";
import { PartnerModel } from "../entity/partner";
import { CreatePartnerPayload, EditPartnerPayload, PartnerQueryDto } from '../dto/partner';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';

export class PartnerService {
  /**
   * Create a new partner
   * @param payload Partner creation data
   * @returns Newly created partner
   */
  async createPartner(payload: CreatePartnerPayload) {
    const exisitingPartner = await PartnerModel.findOne({
      $or: [
        { en: { name: payload.en?.name } },
        { kh: { name: payload.kh?.name } }
      ]
    });
    if (exisitingPartner) {
      throw unprocessableEntity("message.partner_name_exists");
    }
    return await PartnerModel.create({
      en: payload.en,
      kh: payload.kh,
      url: payload.url,
      logo: payload.logo,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Query partners with filtering, pagination and sorting
   * @param queryDto Query parameters
   * @returns Paginated partners and metadata
   */
  async getPartners(queryDto: PartnerQueryDto) {
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

    const partner = await PartnerModel.findOne({
      _id: id,
      deleted_at: null
    });

    if (!partner) {
      throw notFound("Partner not found");
    }

    return partner;
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

    return await partner.save();
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

    return await partner.save();
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

    return result;
  }
}