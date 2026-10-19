export const ADMIN_PAGE_SIZE = 10
export const CATALOG_PAGE_SIZE = 16

export function paginate<T>(items: readonly T[], requestedPage: unknown, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const parsedPage = Number(requestedPage)
  const page = Math.min(totalPages, Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1)
  const offset = (page - 1) * pageSize
  return {
    page,
    totalPages,
    items: items.slice(offset, offset + pageSize),
    start: items.length === 0 ? 0 : offset + 1,
    end: Math.min(offset + pageSize, items.length),
  }
}

export function paginationPages(page: number, totalPages: number): Array<number | "ellipsis"> {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const result: Array<number | "ellipsis"> = []
  let previous = 0
  for (const value of [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)) {
    if (value - previous === 2) result.push(previous + 1)
    else if (value - previous > 2) result.push("ellipsis")
    result.push(value)
    previous = value
  }
  return result
}
