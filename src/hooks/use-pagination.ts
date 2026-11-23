import { useEffect, useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalItems);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, pageSize, safePage],
  );

  return {
    page: safePage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    pageItems,
    setPage,
  };
}
