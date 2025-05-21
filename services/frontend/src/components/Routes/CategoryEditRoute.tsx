import { useNavigate, useParams } from "@solidjs/router"
import { createResource, createSignal, Show } from "solid-js"
import { slugify } from "core"
import { MainTitle, PageLayout } from "../PageLayout"
import {
  apiCategoryExifReindex,
  apiGetCategory,
  apiUpdateCategory,
} from "../../api"
import { css } from "../../../styled-system/css"
import { flex, hstack } from "../../../styled-system/patterns"
import { FormField, Input } from "../Form"
import { routes } from "."
import { TextButton } from "../Form/Button"

export default () => {
  const params = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const slug = () => slugify(params.slug)

  const [category, { mutate }] = createResource(slug, apiGetCategory)
  const [newSlug, setNewSlug] = createSignal(slug())

  return (
    <PageLayout>
      <Show when={category()}>
        {(category) => (
          <div class={css({ padding: "2" })}>
            <MainTitle>{category().name}</MainTitle>
            <form
              class={flex({
                direction: "column",
                alignItems: "flex-start",
                gap: "4",
              })}
              onsubmit={async (e) => {
                e.preventDefault()
                const newCat = await apiUpdateCategory({
                  ...category(),
                  newSlug: newSlug(),
                })
                navigate(routes.Category(newCat.slug))
              }}
            >
              <FormField label="Name">
                <Input
                  value={category().name}
                  onchange={(e) =>
                    mutate({ ...category(), name: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Slug">
                <Input
                  value={newSlug()}
                  onchange={(e) => setNewSlug(slugify(e.target.value))}
                />
              </FormField>

              <div class={hstack()}>
                <FormField label="EXIF">
                  <Input
                    value={category().exifTag ?? ""}
                    onchange={(e) =>
                      mutate({ ...category(), exifTag: e.target.value })
                    }
                  />
                </FormField>
                <TextButton
                  type="button"
                  onclick={async () => {
                    await apiCategoryExifReindex(category().slug)
                    // TODO(ux)
                    alert("OK")
                  }}
                >
                  Reindex
                </TextButton>
              </div>
              <TextButton type="submit">Submit</TextButton>
            </form>
          </div>
        )}
      </Show>
    </PageLayout>
  )
}
