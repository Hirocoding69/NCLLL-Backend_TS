import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { Model, Document, PopulateOptions } from "mongoose";

/* ------------------------------------------------------ */
/*                    Common Interfaces                   */
/* ------------------------------------------------------ */
export interface PaginationMeta {
  items_per_page: number;
  current_page: number;
  total_pages: number;
  total_count: number;
}

export interface PaginationResult<T> {
  meta: PaginationMeta;
  results: T[];
}

/* ------------------------------------------------------ */
/*                   TypeORM Pagination                   */
/* ------------------------------------------------------ */
export interface TypeORMPaginationOptions {
  page: number;
  limit: number;
  order_by?: string;
  order_by_alias?: string;
  allowed_order?: string[];
}

/**
 * Paginate a TypeORM query builder
 * @param qb TypeORM SelectQueryBuilder
 * @param options Pagination options
 * @returns Paginated results and metadata
 */
export async function typeormPaginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  options: TypeORMPaginationOptions
): Promise<PaginationResult<T>> {
  const {
    page,
    limit,
    order_by,
    order_by_alias,
    allowed_order = ["id", "created_at"],
  } = options;
  const offset = (page - 1) * limit;
  
  // Set default order field
  let orderByField = `${qb.alias}.id`;
  if (order_by) {
    const [field, order] = order_by.split(" ");
    if (!["ASC", "DESC"].includes(order.toUpperCase())) {
      throw new Error("Invalid sort value. Must be ASC or DESC");
    }
    if (!allowed_order.includes(field)) {
      throw new Error("Invalid sort field");
    }
    orderByField = `${order_by_alias || qb.alias}.${field}`;
    qb.orderBy(orderByField, order.toUpperCase() as "ASC" | "DESC");
  } else {
    qb.orderBy(orderByField, "DESC");
  }
  
  const [results, totalCount] = await Promise.all([
    qb.clone().limit(limit).offset(offset).getMany(),
    qb
      .clone()
      .select(`COUNT(DISTINCT(${qb.alias}.id))`, "count")
      .getRawOne()
      .then((res) => +res?.count || 0),
  ]);
  
  return {
    results,
    meta: {
      items_per_page: limit,
      current_page: page,
      total_count: totalCount,
      total_pages: Math.max(Math.ceil(totalCount / limit), 1),
    },
  };
}

/* ------------------------------------------------------ */
/*                  MongoDB Pagination                    */
/* ------------------------------------------------------ */
export interface MongoPaginationOptions {
  page?: number;
  limit?: number;
  order_by?: string;
  allowed_order?: string[];
  filter?: Record<string, any>;
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
  select?: string | Record<string, number | boolean | object>;
}

/**
 * Paginate a Mongoose model query
 * @param model Mongoose model
 * @param options Pagination options
 * @returns Paginated results and metadata
 */
export async function mongoPaginate<T>(
  model: Model<any>,
  options: MongoPaginationOptions
): Promise<PaginationResult<T>> {
  const {
    page = 1,
    limit = 10,
    order_by,
    allowed_order = ["_id", "created_at"],
    filter = {},
    populate,
    select
  } = options;
  const offset = (page - 1) * limit;
 
  // Default sorting
  let sortObj: Record<string, 1 | -1> = { _id: -1 };
  if (order_by) {
    const [field, order] = order_by.split(" ");
    if (!["ASC", "DESC", "asc", "desc"].includes(order)) {
      throw new Error("Invalid sort value. Must be ASC or DESC");
    }
    if (!allowed_order.includes(field)) {
      throw new Error("Invalid sort field");
    }
    sortObj = { [field]: order.toUpperCase() === "ASC" ? 1 : -1 };
  }
 
  // Query with pagination
  let query = model.find(filter).sort(sortObj).skip(offset).limit(limit);
 
  // Handle different populate formats
  if (populate) {
    if (typeof populate === 'string') {
      query = query.populate(populate);
    } else if (Array.isArray(populate)) {
      populate.forEach(path => {
        if (typeof path === 'string') {
          query = query.populate(path);
        } else {
          query = query.populate(path as PopulateOptions);
        }
      });
    } else {
      query = query.populate(populate as PopulateOptions);
    }
  }
  
  if (select) {
    query = query.select(select);
  }
  
  // Execute query and count in parallel
  const [results, totalCount] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);
 
  return {
    results: results as T[],
    meta: {
      items_per_page: limit,
      current_page: page,
      total_count: totalCount,
      total_pages: Math.max(Math.ceil(totalCount / limit), 1),
    },
  };
}

/* ------------------------------------------------------ */
/*                   Legacy Support                       */
/* ------------------------------------------------------ */

/**
 * @deprecated Use typeormPaginate instead
 */
export const paginate = typeormPaginate;

/**
 * Helper function to create a populate object for MongoDB
 * @param path The path to populate
 * @param model The model to use for population
 * @param select Optional fields to select
 * @returns PopulateOptions object
 */
export function createPopulateOptions(
  path: string, 
  model: string,
  select?: string
): PopulateOptions {
  return {
    path,
    model,
    select
  };
}

/**
 * Helper function to create a nested populate for MongoDB
 * @param path The path to populate
 * @param model The model to use for population
 * @param populatePath The child path to populate
 * @param populateModel The model to use for child population
 * @param select Optional fields to select
 * @returns PopulateOptions object with nested populate
 */
export function createNestedPopulateOptions(
  path: string,
  model: string,
  populatePath: string,
  populateModel: string,
  select?: string
): PopulateOptions {
  return {
    path,
    model,
    select,
    populate: {
      path: populatePath,
      model: populateModel
    }
  };
}