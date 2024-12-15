import db, { camera_lenses, type CameraLenses } from "db"

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
