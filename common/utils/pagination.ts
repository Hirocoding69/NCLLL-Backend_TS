import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

/* ------------------------------------------------------ */
/*                    Normal pagination                   */
/* ------------------------------------------------------ */

export interface PaginationOptions {
  page: number;
  limit: number;
  order_by?: string;
  order_by_alias?: string;
  allowed_order?: string[];
  useSimpleCount?: boolean;
  two_step?: {
    id_only?: boolean;
    relations?: string[];
    order_by_raw?: string;
  };
}

export interface PaginationResult<T> {
  meta: {
    items_per_page: number;
    current_page: number;
    total_pages: number;
    total_count: number;
  };
  results: T[];
}

export interface RawPaginationOptions<T = any> {
  page: number;
  limit: number;
  mapper?: (raw: any) => T;
  useSimpleCount?: boolean;
}

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const {
    page,
    limit,
    order_by,
    order_by_alias,
    allowed_order = ["id", "created_at"],
  } = options;
  const offset = (page - 1) * limit;

  let orderByField = `${qb.alias}.id`;
  if (order_by) {
    const [field, order] = order_by.split(" ");
    if (order !== "ASC" && order !== "DESC") {
      throw "invalid sort value. must be asc or desc";
    }

    if (allowed_order && !allowed_order.includes(field)) {
      throw "invalid sort field";
    }

    orderByField = `${order_by_alias || qb.alias}.${field}`;
    qb.orderBy(orderByField, order);
  } else {
    qb.orderBy(orderByField, "DESC");
  }

  const [results, totalCount] = await Promise.all([
    qb.clone().limit(limit).offset(offset).getMany(),
    qb
      .clone()
      .select("COUNT(*)", "count")
      .groupBy(`${qb.alias}.id`)
      .getRawOne()
      .then((res) => +res?.count),
  ]);

  return {
    results: results,
    meta: {
      items_per_page: limit,
      current_page: page,
      total_count: totalCount || 0,
      total_pages: Math.ceil(totalCount / limit) || 1,
    },
  };
}

/* ------------------------------------------------------ */
/*                Raw Pagination Function                 */
/* ------------------------------------------------------ */

export async function paginateRaw<T = any>(
  qb: SelectQueryBuilder<any>,
  options: RawPaginationOptions<T>
): Promise<PaginationResult<T>> {
  const { page, limit, mapper, useSimpleCount } = options;

  const offset = (page - 1) * limit;

  const [rawResults, totalCount] = await Promise.all([
    qb.clone().limit(limit).offset(offset).getRawMany(),
    options.useSimpleCount
      ? qb.clone().getCount()
      : qb
          .clone()
          .select("COUNT(*)", "count")
          .getRawOne()
          .then((res) => +res?.count),
  ]);

  const results = mapper ? rawResults.map(mapper) : rawResults;

  return {
    results,
    meta: {
      items_per_page: limit,
      current_page: page,
      total_count: totalCount || 0,
      total_pages: Math.ceil(totalCount / limit) || 1,
    },
  };
}

/* ------------------------------------------------------ */
/*                    Cursor Pagination                   */
/* ------------------------------------------------------ */

export interface CursorPaginationOptions {
  last: number;
  limit: number;
  order_by?: string;
}

export interface CursorPaginationResult<T> {
  meta: {
    has_next: boolean;
  };
  results: T[];
}

export async function cursorPaginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  options: CursorPaginationOptions
): Promise<CursorPaginationResult<T>> {
  const { last, limit, order_by } = options;

  if (order_by !== "ASC" && order_by !== "DESC") {
    throw "invalid sort value. must be asc or desc";
  }

  if (last > 0) {
    qb.andWhere(`${qb.alias}.id ${order_by === "ASC" ? ">" : "<"} :last`, {
      last,
    });
  }

  const results = await qb
    .orderBy(`${qb.alias}.id`, order_by as "ASC" | "DESC")
    .groupBy(`${qb.alias}.id`)
    .limit(limit + 1)
    .getMany();

  const hasNext = results.length > limit;
  if (hasNext) {
    results.pop();
  }

  return {
    meta: {
      has_next: hasNext,
    },
    results,
  };
}

/* ------------------------------------------------------ */
/*                    Paginated With Relations            */
/* ------------------------------------------------------ */

export async function paginateWithRelations<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const {
    page,
    limit,
    order_by,
    order_by_alias,
    allowed_order = ["id", "created_at"],
    two_step,
  } = options;
  const offset = (page - 1) * limit;

  if (two_step?.id_only) {
    const idsQb = qb.clone().select(`${qb.alias}.id`, "id");

    if (two_step.order_by_raw) {
      idsQb.orderBy(two_step.order_by_raw);
    } else if (order_by) {
      const [field, order] = order_by.split(" ");
      if (order !== "ASC" && order !== "DESC") {
        throw "invalid sort value. must be asc or desc";
      }

      if (allowed_order && !allowed_order.includes(field)) {
        throw "invalid sort field";
      }

      idsQb.orderBy(
        `${order_by_alias || qb.alias}.${field}`,
        order as "ASC" | "DESC"
      );
    } else {
      idsQb.orderBy(`${qb.alias}.id`, "DESC");
    }

    const [totalCount, ids] = await Promise.all([
      idsQb.getCount(),
      idsQb
        .offset(offset)
        .limit(limit)
        .getRawMany()
        .then((results) => results.map((r) => r.id)),
    ]);

    const fullQb = qb.clone().whereInIds(ids);
    if (two_step.relations) {
      two_step.relations.forEach((relation) => {
        fullQb.leftJoinAndSelect(`${qb.alias}.${relation}`, relation);
      });
    }

    const results = await fullQb.orderBy(`${qb.alias}.id`, "DESC").getMany();

    return {
      results: results.slice(0, limit),
      meta: {
        items_per_page: limit,
        current_page: page,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / limit),
      },
    };
  }

  let orderByField = `${qb.alias}.id`;
  if (order_by) {
    const [field, order] = order_by.split(" ");
    if (order !== "ASC" && order !== "DESC") {
      throw "invalid sort value. must be asc or desc";
    }

    if (allowed_order && !allowed_order.includes(field)) {
      throw "invalid sort field";
    }

    orderByField = `${order_by_alias || qb.alias}.${field}`;
    qb.orderBy(orderByField, order);
  } else {
    qb.orderBy(orderByField, "DESC");
  }

  const [results, totalCount] = await Promise.all([
    qb.clone().limit(limit).offset(offset).getMany(),
    qb.clone().select(`DISTINCT ${qb.alias}.id`).getCount(),
  ]);

  return {
    results,
    meta: {
      items_per_page: limit,
      current_page: page,
      total_count: totalCount,
      total_pages: Math.ceil(totalCount / limit),
    },
  };
}
