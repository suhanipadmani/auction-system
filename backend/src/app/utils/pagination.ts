/**
 * Standardizes pagination parameters from request queries.
 */
export const getPagination = (query: any) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(1000, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as string)?.toLowerCase() === "asc" ? 1 : -1;

  return {
    page,
    limit,
    skip,
    sort: { [sortBy]: sortOrder },
    sortBy,
    sortOrder: sortOrder === 1 ? "asc" : "desc" as "asc" | "desc",
  };
};

/**
 * Formats the pagination meta information for responses.
 */
export const getPagingMeta = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
