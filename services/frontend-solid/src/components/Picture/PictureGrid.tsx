import { For, type VoidComponent } from "solid-js"
import type { PictureApi } from "api-types"
import { splitInLines } from "../../utils/splitInLines"
import { hstack, vstack } from "../../../styled-system/patterns"
import { Picture } from "./Picture"
import { css } from "../../../styled-system/css"
import { routes } from "../Routes"
import type { SpacingToken } from "../../../styled-system/tokens"

const gap: SpacingToken = "2"

export interface PictureGridProps {
  pictures: readonly PictureApi[]
  sizes?: string
}
export const PictureGrid: VoidComponent<PictureGridProps> = (p) => {
  const lines = () => splitInLines(p.pictures)
  return (
    <div class={vstack({ gap, p: gap, alignItems: "initial" })}>
      <For each={lines()}>
        {(line) => (
          <div
            class={hstack({ gap, alignItems: "initial" })}
            style={{ "aspect-ratio": line.aspectRatio }}
          >
            <For each={line.pictures}>
              {(p) => (
                <a
                  class={css({
                    display: "contents",
                    "& > *": { borderRadius: "md", overflow: "hidden" },
                  })}
                  href={routes.Picture(p.id)}
                >
                  <Picture picture={p} sizes="20vw" />
                </a>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  )
}
