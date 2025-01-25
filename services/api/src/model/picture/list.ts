import db, { paginate, pictures, type PaginateOptions } from "db"

export const listPictures = async (p: PaginateOptions) =>
  await paginate(pictures(db).find().orderByDesc("shot_at"), p)
