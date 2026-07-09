export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  skip: number,
  limit: number
): PaginatedResponse<T> {
  const page = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page: Number(page) || 1,
    pageSize: Number(limit),
    totalPages,
    hasNextPage: Number(page) < Number(totalPages),
    hasPreviousPage: Number(page) > 1,
  };
}
