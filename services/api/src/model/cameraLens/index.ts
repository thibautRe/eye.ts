import { batch, dedupeAsync } from "@databases/dataloader"
import db, { camera_lenses, q, type CameraLenses } from "db"
import createCache from "../../utils/createCache"

export const getCameraLensByName = dedupeAsync<string, CameraLenses | null>(
  async (name) => (name ? await camera_lenses(db).findOne({ name }) : null),
)

export const getCameraLensById = dedupeAsync<CameraLenses["id"], CameraLenses>(
  batch<CameraLenses["id"], CameraLenses>(async (ids) => {
    const lenses = await camera_lenses(db)
      .find({ id: q.anyOf(ids) })
      .all()
    const lensesById = new Map(lenses.map((b) => [b.id, b]))
    return {
      get: (id) => {
        if (lensesById.has(id)) return lensesById.get(id)!
        throw Object.assign(new Error("Cannot find lens"), { id })
      },
    }
  }),
  { cache: createCache({ name: "CameraLensesById" }) },
)
