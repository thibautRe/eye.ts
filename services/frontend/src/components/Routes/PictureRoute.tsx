import { createResource, Show, type VoidComponent } from "solid-js"
import {
  apiCreateCategory,
  apiGetPicture,
  apiPictureParentAdd,
  apiPictureParentDel,
} from "../../api"
import { PageLayout } from "../PageLayout"
import { useParams } from "@solidjs/router"
import { slugify, type PictureId } from "core"
import { Picture } from "../Picture/Picture"
import type { PictureApi } from "api-types"
import { vstack } from "../../../styled-system/patterns"
import { PictureMetadata } from "../Picture/PictureMetadata"
import { css } from "../../../styled-system/css"
import { ParentCategory } from "../Category/ParentCategories"

export default () => {
  const params = useParams<{ id: string }>()
  const [pictureRes, { mutate }] = createResource(
    () => params.id as PictureId,
    apiGetPicture,
  )
  return (
    <PageLayout>
      <Show when={pictureRes()}>
        {(picture) => (
          <PictureItem picture={picture()} onPictureChange={mutate} />
        )}
      </Show>
    </PageLayout>
  )
}

const PictureItem: VoidComponent<{
  picture: PictureApi
  onPictureChange: (p: PictureApi) => void
}> = (p) => {
  return (
    <div class={vstack({ gap: "4", alignItems: "initial" })}>
      <ParentCategory
        parents={p.picture.directParents}
        onCreate={async (name) => {
          const category = await apiCreateCategory({
            name,
            slug: slugify(name),
            childPictureId: p.picture.id,
          })
          p.onPictureChange({
            ...p.picture,
            directParents: [...p.picture.directParents, category],
          })
        }}
        onAdd={async (slug) =>
          p.onPictureChange(await apiPictureParentAdd(p.picture.id, slug))
        }
        onDel={async (slug) =>
          p.onPictureChange(await apiPictureParentDel(p.picture.id, slug))
        }
      />
      <div
        class={pictureWrapper}
        ref={(e) =>
          requestAnimationFrame(() => e.scrollIntoView({ behavior: "instant" }))
        }
      >
        <Picture picture={p.picture} sizes="100vw" />
      </div>
      <div class={css({ paddingInline: "2" })}>
        <PictureMetadata picture={p.picture} />
      </div>
    </div>
  )
}

const pictureWrapper = css({
  height: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
})
