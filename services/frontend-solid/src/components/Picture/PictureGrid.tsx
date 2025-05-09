import { For, type VoidComponent } from "solid-js"
import type { PictureApi } from "api-types"
import { splitInLines } from "../../utils/splitInLines"

export interface PictureGridProps {
  pictures: readonly PictureApi[]
  sizes?: string
}
export const PictureGrid: VoidComponent<PictureGridProps> = (p) => {
  const lines = () => splitInLines(p.pictures)
  return (
    <div>
      <For each={lines()}>
        {(line) => (
          <div style={{ "aspect-ratio": line.aspectRatio }}>
            <For each={line.pictures}>
              {(picture) => <div>{picture.id}</div>}
            </For>
          </div>
        )}
      </For>
    </div>
  )
}
