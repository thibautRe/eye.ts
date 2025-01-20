import { batch, dedupeAsync } from "@databases/dataloader"
import db, { camera_bodies, q, type CameraBodies } from "db"
import createCache from "../../utils/createCache"

export const getCameraBodyByName = dedupeAsync<string, CameraBodies | null>(
  async (name) => (name ? await camera_bodies(db).findOne({ name }) : null),
)

export const getCameraBodyById = dedupeAsync<CameraBodies["id"], CameraBodies>(
  batch<CameraBodies["id"], CameraBodies>(async (ids) => {
    const bodies = await camera_bodies(db)
      .find({ id: q.anyOf(ids) })
      .all()
    const bodiesById = new Map(bodies.map((b) => [b.id, b]))
    return {
      get: (id) => {
        if (bodiesById.has(id)) return bodiesById.get(id)!
        throw Object.assign(new Error("Cannot find body"), { id })
      },
    }
  }),
  { cache: createCache({ name: "CameraBodiesById" }) },
)
