import db, { camera_bodies, type CameraBodies } from "db"

const cacheByName = new Map<string, Promise<CameraBodies | null>>()
const cacheById = new Map<CameraBodies["id"], Promise<CameraBodies>>()

export const getCameraBodyByName = async (
  name: string,
): Promise<CameraBodies | null> => {
  if (!name) return null
  if (cacheByName.has(name)) return await cacheByName.get(name)!
  const promise = (async () => {
    const body = await camera_bodies(db).findOne({ name })
    if (!body) cacheByName.delete(name)
    return body
  })()
  cacheByName.set(name, promise)
  return await promise
}

export const getCameraBodyById = async (
  id: CameraBodies["id"],
): Promise<CameraBodies> => {
  if (cacheById.has(id)) return await cacheById.get(id)!
  const promise = camera_bodies(db).findOneRequired({ id })
  cacheById.set(id, promise)
  return await promise
}
