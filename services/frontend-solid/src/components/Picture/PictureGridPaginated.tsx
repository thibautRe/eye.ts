import { Show, type VoidComponent } from "solid-js"
import type { PictureApi } from "api-types"
import { PictureGrid } from "./PictureGrid"
import type { PaginatedLoader } from "../../hooks/createPaginatedLoader"

interface PictureGridPaginatedProps {
  loader: PaginatedLoader<PictureApi>
}
export const PictureGridPaginated: VoidComponent<PictureGridPaginatedProps> = (
  p,
) => {
  const hasMore = () => p.loader.data().nextPage !== null
  return (
    <>
      <PictureGrid pictures={p.loader.data().items} />
      <Show when={hasMore()}>
        <button onClick={p.loader.onLoadNext}>Show more</button>
      </Show>
    </>
  )
}
