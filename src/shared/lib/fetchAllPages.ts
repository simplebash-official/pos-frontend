import type { PaginatedResponse } from '@/shared/types/common';

/**
 * Every backend list endpoint caps its page size (100-200 items depending on
 * the module), so a single request cannot return "everything" once a shop's
 * data grows past that cap. This loops a paginated fetch until every page
 * has been collected, for hooks that need the complete current dataset up
 * front — the same guarantee the (now removed) Dexie mirror gave for free.
 */
export const fetchAllPages = async <T>(
  fetchPage: (page: number) => Promise<PaginatedResponse<T>>
): Promise<T[]> => {
  const items: T[] = [];
  let page = 1;

  for (;;) {
    const response = await fetchPage(page);
    items.push(...response.items);
    if (response.items.length === 0 || page >= response.totalPages) {
      break;
    }
    page += 1;
  }

  return items;
};
