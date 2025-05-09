import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../hooks/createPaginatedLoader"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"

export default () => {
  const loader = createPaginatedLoader({
    loader: apiGetPictures,
    cacheKey: () => "picture-list-route",
  })
  return <PictureGridPaginated loader={loader} />
}
