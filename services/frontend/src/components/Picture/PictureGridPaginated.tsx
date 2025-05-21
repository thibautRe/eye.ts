import { Show, type VoidComponent } from "solid-js"
import type { PictureApi } from "api-types"
import { PictureGrid } from "./PictureGrid"
import type { PaginatedLoader } from "../../hooks/createPaginatedLoader"
import { TextButton } from "../Form/Button"

interface PictureGridPaginatedProps {
  loader: PaginatedLoader<PictureApi>
}
export const PictureGridPaginated: VoidComponent<PictureGridPaginatedProps> = (
  p,
) => {
  const hasMore = () =>
    p.loader.data().nextPage !== null && p.loader.data().items.length > 0
  return (
    <>
      <Show
        when={p.loader.data().items.length > 0}
        fallback={<span>No pictures</span>}
      >
        <PictureGrid pictures={p.loader.data().items} />
      </Show>
      <Show when={hasMore()}>
        <TextButton onClick={p.loader.onLoadNext}>Show more</TextButton>
      </Show>
    </>
  )
}
