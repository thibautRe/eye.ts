import tables from "@databases/pg-typed"
import DatabaseSchema from "./__generated__"
import type {
  CameraBodies,
  CameraLenses,
  PictureSizes,
  Pictures,
  Users,
} from "./__generated__"

const { camera_bodies, camera_lenses, picture_sizes, pictures, users } =
  tables<DatabaseSchema>({
    databaseSchema: require("./__generated__/schema.json"),
  })

export {
  CameraBodies,
  camera_bodies,
  CameraLenses,
  camera_lenses,
  PictureSizes,
  picture_sizes,
  Pictures,
  pictures,
  Users,
  users,
}
