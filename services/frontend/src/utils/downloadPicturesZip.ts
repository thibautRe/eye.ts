import {
  apiGetPicturesZipPreflight,
  apiGetPicturesZipRoute,
  type ApiGetPicturesParams,
} from "../api"

export const downloadPicturesZip = async (params: ApiGetPicturesParams) => {
  const preflightRes = await apiGetPicturesZipPreflight(params)
  if (
    !confirm(
      `This will download ${preflightRes.pictureAmt} pictures, resulting in a ${preflightRes.approximateSizeBytes / 1_000_000_000}GB file. Continue?`,
    )
  )
    return

  const a = document.createElement("a")
  // @ts-expect-error
  a.style = "display: none"
  document.documentElement.appendChild(a)
  a.href = apiGetPicturesZipRoute(params)
  a.download = ""
  a.click()
  document.documentElement.removeChild(a)
}
