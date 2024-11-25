import tables from "@databases/pg-typed"
import DatabaseSchema from "./__generated__"

const { camera_bodies, camera_lenses, picture_sizes, pictures, users } =
  tables<DatabaseSchema>({
    databaseSchema: require("./__generated__/schema.json"),
  })

export { camera_bodies, camera_lenses, picture_sizes, pictures, users }
