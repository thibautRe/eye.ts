import type { PaginatedApiLoader } from "./api/pagination"

export interface SerializedPaginatedLoader<T> {
  items: T[]
  nextPage: number | null
}

export class PaginatedLoader<T, P = {}> {
  items = $state<T[]>([])
  nextPage = $state<number | null>(0)
  isLoadingNextPage = $state(false)
  error = $state(false)

  constructor(private loader: PaginatedApiLoader<T, P>, private params?: P) {}

  public onLoadNext = async () => {
    const { nextPage } = this
    if (nextPage === null || this.isLoadingNextPage) {
      console.info("Paginated loader - skipping")
      return
    }

    this.isLoadingNextPage = true

    try {
      const res = await this.loader({ page: nextPage }, this.params)
      this.items = [...this.items, ...res.items]
      this.nextPage = res.info.nextPage
    } catch (err) {
      console.error("Error while loading paginated endpoint")
      console.error(err)
      this.error = true
    } finally {
      this.isLoadingNextPage = false
    }
  }

  public serialize = (): SerializedPaginatedLoader<T> => ({
    items: this.items,
    nextPage: this.nextPage,
  })
  public fromSerialized = (serialized: SerializedPaginatedLoader<T>) => {
    this.items = serialized.items
    this.nextPage = serialized.nextPage
    return this
  }
}

export const getSerializedPaginatedLoader = async <T, P>(
  loader: PaginatedApiLoader<T, P>,
  params?: P,
): Promise<SerializedPaginatedLoader<T>> => {
  const l = new PaginatedLoader(loader, params)
  await l.onLoadNext()
  return l.serialize()
}
