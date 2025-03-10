import type { CategoryApi } from "api-types"
import { slugify } from "core"
import type { PageLoad } from "./$types"
import { apiGetCategory } from "$lib/api"

export const load: PageLoad = async ({ params }): Promise<CategoryApi> =>
  await apiGetCategory(slugify(params.slug))
