import { useNavigate, useParams } from "@solidjs/router"
import { createResource, Show } from "solid-js"
import { slugify } from "core"
import { MainTitle, PageLayout } from "../PageLayout"
import { apiGetCategory, apiUpdateCategory } from "../../api"
import { css } from "../../../styled-system/css"
import { flex } from "../../../styled-system/patterns"
import { FormField, Input } from "../Form"
import { routes } from "."

export default () => {
  const params = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const slug = () => slugify(params.slug)

  const [category, { mutate }] = createResource(slug, apiGetCategory)

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
                await apiUpdateCategory(category())
                navigate(routes.Category(category().slug))
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

              <FormField label="EXIF">
                <Input
                  value={category().exifTag ?? ""}
                  onchange={(e) =>
                    mutate({ ...category(), exifTag: e.target.value })
                  }
                />
              </FormField>
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
      </Show>
    </PageLayout>
  )
}
