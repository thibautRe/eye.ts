import tables from "@databases/pg-typed"
import type DatabaseSchema from "./__generated__"
export type {
  CameraBodies,
  CameraLenses,
  CategoryLeaves,
  CategoryParents,
  PictureSizes,
  Pictures,
  Users,
} from "./__generated__"

export const {
  camera_bodies,
  camera_lenses,
  category_leaves,
  category_parents,
  picture_sizes,
  pictures,
  users,
} = tables<DatabaseSchema>({
  databaseSchema: require("./__generated__/schema.json"),
})
