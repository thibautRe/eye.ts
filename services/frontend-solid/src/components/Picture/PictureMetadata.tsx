import type { PictureApi } from "api-types"
import { For, Show, type VoidComponent } from "solid-js"
import { hstack, stack } from "../../../styled-system/patterns"

export interface PictureMetadataProps {
  picture: PictureApi
}
type PictureMetadataComponent = VoidComponent<PictureMetadataProps>

export const PictureIso: PictureMetadataComponent = (props) => (
  <Show when={props.picture.exif.ISO}>
    <span>ISO-{props.picture.exif.ISO}</span>
  </Show>
)

export const PictureAperture: PictureMetadataComponent = (props) => (
  <Show
    when={
      props.picture.exif.FNumber && parseInt(props.picture.exif.FNumber, 10)
    }
  >
    <span>f/{props.picture.exif.FNumber}</span>
  </Show>
)

const parseExposure = (exposure: string) => {
  const expF = parseFloat(exposure)
  if (expF < 1) return `1/${1 / expF}s`
  return `${expF}"`
}
export const PictureExposure: PictureMetadataComponent = (props) => (
  <Show when={props.picture.exif.ExposureTime}>
    {(exp) => <span>{parseExposure(exp())}</span>}
  </Show>
)

export const PictureFocalLength: PictureMetadataComponent = (props) => (
  <Show when={props.picture.exif.FocalLength}>
    <span>{props.picture.exif.FocalLength}mm</span>
  </Show>
)
export const PictureShotAt: PictureMetadataComponent = (props) => (
  <Show when={props.picture.shotAt}>
    {(shotAt) => (
      <span>
        {new Date(shotAt()).toLocaleString("en", {
          dateStyle: "full",
          timeStyle: "short",
        })}
      </span>
    )}
  </Show>
)
export const PictureCameraLens: PictureMetadataComponent = (props) => (
  <Show when={props.picture.cameraLens}>
    {(lens) => <span>{lens.name}</span>}
  </Show>
)

export const PictureExifTable: PictureMetadataComponent = (props) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <For each={Object.entries(props.picture.exif)}>
        {([property, value]) => (
          <tr>
            <td>{property}</td>
            <td>{value}</td>
          </tr>
        )}
      </For>
    </tbody>
  </table>
)

export const PictureMetadata: PictureMetadataComponent = (props) => (
  <div class={stack({ direction: "column", gap: "2" })}>
    <div class={hstack({ gap: "4" })}>
      <PictureAperture picture={props.picture} />
      <PictureFocalLength picture={props.picture} />
      <PictureExposure picture={props.picture} />
      <PictureIso picture={props.picture} />
    </div>
    <PictureShotAt picture={props.picture} />
    <PictureCameraLens picture={props.picture} />
    <details>
      <summary>EXIF</summary>
      <PictureExifTable picture={props.picture} />
    </details>
  </div>
)
