import db, { camera_lenses, q, type CameraLenses } from "db"

const cacheByName = new Map<string, Promise<CameraLenses | null>>()
const cacheById = new Map<CameraLenses["id"], Promise<CameraLenses>>()

export const getCameraLensByName = async (
  name: string,
): Promise<CameraLenses | null> => {
  if (!name) return null
  if (cacheByName.has(name)) return await cacheByName.get(name)!
  const promise = (async () => {
    const lens = await camera_lenses(db).findOne({ name })
    if (!lens) cacheByName.delete(name)
    return lens
  })()
  cacheByName.set(name, promise)
  return await promise
}

export const getCameraLensById = async (
  id: CameraLenses["id"],
): Promise<CameraLenses> => {
  if (cacheById.has(id)) return await cacheById.get(id)!
  const promise = camera_lenses(db).findOneRequired({ id })
  cacheById.set(id, promise)
  return await promise
}

export const getCameraLensByIds = async (...ids: CameraLenses["id"][]) => {
  const lenses: Promise<CameraLenses>[] = []
  const missingIds = new Set<CameraLenses["id"]>()
  for (const id of ids) {
    if (cacheById.has(id)) {
      lenses.push(cacheById.get(id)!)
      continue
    }
    missingIds.add(id)
  }

  const missing = async () => {
    const lenses = await camera_lenses(db)
      .find({ id: q.anyOf(missingIds) })
      .all()
    // add to cache
    for (const i of lenses) {
      cacheById.set(i.id, Promise.resolve(i))
    }
    return lenses
  }

  const [m, ...l] = await Promise.all([missing(), ...lenses])
  return [...m, ...l]
}
