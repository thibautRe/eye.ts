import { post } from "./utils"

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  await post("/api/upload", formData)
}

export const uploadFiles = async (filelist: FileList) => {
  for (const file of filelist) {
    await uploadFile(file)
  }
}
