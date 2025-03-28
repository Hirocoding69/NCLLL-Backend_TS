import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { CreateFocusAreaPayload, EditFocusAreaPayload, FocusAreaQueryDto } from '../dto/focus-area';
import { FocusAreaModel } from '../entity/focus-area';
import { MongoPaginationOptions, mongoPaginate } from '~/common/utils/pagination';

export class FocusAreaService {
  /**
   * Create a new focus area
   * @param payload FocusArea creation data
   * @returns Newly created focus area
   */
  async createFocusArea(payload: CreateFocusAreaPayload) {
    return await FocusAreaModel.create({
      en: payload.en,
      kh: payload.kh,
      cover: payload.cover,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Query focus areas with filtering, pagination and sorting
   * @param queryDto Query parameters
   * @returns Paginated focus areas and metadata
   */
  async getFocusAreas(queryDto: FocusAreaQueryDto) {
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
    const allowed_order = ['created_at', 'updated_at', 'category'];

    // Configure pagination options
    const paginationOptions: MongoPaginationOptions = {
      page,
      limit,
      order_by,
      allowed_order,
      filter,
      select: '-en.document -kh.document -deleted_at -__v'
    };

    // Execute paginated query
    return await mongoPaginate(FocusAreaModel, paginationOptions);
  }

  /**
   * Get a focus area by ID
   * @param id FocusArea ID
   * @returns FocusArea document
   */
  async getFocusAreaById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid focus area ID format");
    }

    const focusArea = await FocusAreaModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!focusArea) {
      throw notFound("Focus area not found");
    }
    
    return focusArea;
  }

  /**
   * Update a focus area by ID
   * @param payload FocusArea update data with ID
   * @returns Updated focus area
   */
  async updateFocusArea(payload: EditFocusAreaPayload) {
    const { id, ...updateData } = payload;
    
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid focus area ID format");
    }

    const focusArea = await FocusAreaModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!focusArea) {
      throw notFound("Focus area not found");
    }

    // Update focus area info
    if (updateData.en) {
      focusArea.en = {
        ...(focusArea.en as any),
        ...updateData.en
      };
    }
    
    if (updateData.kh) {
      focusArea.kh = {
        ...(focusArea.kh as any),
        ...updateData.kh
      };
    }

    if (updateData.cover) focusArea.cover = updateData.cover;

    focusArea.updated_at = new Date();
    
    return await focusArea.save();
  }

  /**
   * Soft delete a focus area
   * @param id FocusArea ID
   * @returns Deleted focus area
   */
  async deleteFocusArea(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid focus area ID format");
    }

    const focusArea = await FocusAreaModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!focusArea) {
      throw notFound("Focus area not found");
    }
    
    focusArea.deleted_at = new Date();
    focusArea.updated_at = new Date();
    
    return await focusArea.save();
  }
}