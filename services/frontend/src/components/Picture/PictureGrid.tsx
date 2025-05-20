import { For, Show, type VoidComponent } from "solid-js"
import type { PictureApi } from "api-types"
import { splitInLines } from "../../utils/splitInLines"
import { hstack, vstack } from "../../../styled-system/patterns"
import { Picture } from "./Picture"
import { css } from "../../../styled-system/css"
import { routes } from "../Routes"
import type { SpacingToken } from "../../../styled-system/tokens"
import { Checkbox } from "../Form/Checkbox"
import { useMultiselectContext } from "../../contexts/MultiselectContext"

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
            <For each={line.pictures}>{(p) => <PictureItem picture={p} />}</For>
          </div>
        )}
      </For>
    </div>
  )
}

const PictureItem: VoidComponent<{ picture: PictureApi }> = (p) => {
  const [store, updater] = useMultiselectContext()
  const pic = () => <Picture picture={p.picture} sizes="25vw" />

  return (
    <Show
      when={store.enabled}
      fallback={
        <a class={pictureItemWrapper} href={routes.Picture(p.picture.id)}>
          {pic()}
        </a>
      }
    >
      <label class={css({ position: "relative" })}>
        <div class={css({ position: "absolute", top: 0, right: 0, zIndex: 1 })}>
          <Checkbox
            checked={store.selectedIds.has(p.picture.id)}
            onCheckedChange={() => updater.onToggleSelection(p.picture.id)}
          />
        </div>
        <div class={pictureItemWrapper}>{pic()}</div>
      </label>
    </Show>
  )
}

const pictureItemWrapper = css({
  display: "contents",
  "& > *": { borderRadius: "md", overflow: "hidden" },
})
