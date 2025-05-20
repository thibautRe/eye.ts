import type { PictureApi } from "api-types"
import { createEffect, For, Match, Switch, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import { flex, stack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"
import { MainTitle, PageLayout } from "../PageLayout"
import { apiUploadFile } from "../../api"
import { PictureRaw } from "../Picture/Picture"
import { routes } from "."
import { Button } from "../Form/Button"

export default () => {
  return (
    <PageLayout>
      <div class={stack({ direction: "column", paddingInline: "2" })}>
        <MainTitle>Upload</MainTitle>
        <PictureUpload />
      </div>
    </PageLayout>
  )
}

interface FileImportBase {
  file: File
}
interface FileImportPending extends FileImportBase {
  state: "pending"
}
interface FileImportUploading extends FileImportBase {
  state: "uploading"
}
interface FileImportUploaded extends FileImportBase {
  state: "uploaded"
  picture: PictureApi
}
interface FileImportError extends FileImportBase {
  state: "error"
  message: string
}

type FileImport =
  | FileImportPending
  | FileImportUploading
  | FileImportUploaded
  | FileImportError

const MAX_UPLOAD_CONCURRENCY = 3
const [store, setStore] = createStore<FileImport[]>([])
createEffect(async () => {
  if (
    store.filter((i) => i.state === "uploading").length >=
    MAX_UPLOAD_CONCURRENCY
  )
    return
  const pending = store.find((i) => i.state === "pending")
  if (!pending) return

  try {
    setStore((f) => f.file === pending.file, {
      state: "uploading",
      file: pending.file,
    })
    const picture = await apiUploadFile(pending.file)
    setStore((f) => f.file === pending.file, {
      state: "uploaded",
      file: pending.file,
      picture,
    })
  } catch (err) {
    console.error(err)
    setStore((f) => f.file === pending.file, {
      state: "error",
      file: pending.file,
      message: (err as Error).message,
    })
  }
})

const PictureUpload: VoidComponent = () => {
  return (
    <div class={flex({ direction: "column" })}>
      <input
        type="file"
        multiple
        accept=".jpg, .jpeg"
        onchange={async (e) => {
          const files = e.currentTarget.files
          e.currentTarget.files = null
          if (!files) return

          setStore((i) => [
            ...i,
            ...Array.from(files).map(
              (file): FileImportPending => ({ file, state: "pending" }),
            ),
          ])
        }}
      />

      {store.length > 0 && (
        <div class={flex({ direction: "column", gap: "4" })}>
          <h2>Uploading</h2>
          <ul class={flex({ wrap: "wrap", gap: "2" })}>
            <For each={store}>
              {(i) => (
                <Switch>
                  <Match
                    when={i.state === "pending" || i.state === "uploading"}
                  >
                    <li class={pictureBox}>
                      {i.file.name}: {i.state}
                    </li>
                  </Match>
                  <Match when={i.state === "uploaded" && i}>
                    {(i) => (
                      <li class={pictureBox}>
                        <a
                          class={css({ display: "contents" })}
                          href={routes.Picture(i().picture.id)}
                        >
                          <PictureRaw
                            picture={i().picture}
                            sizes="180px"
                            style={{ "object-fit": "contain" }}
                          />
                        </a>
                      </li>
                    )}
                  </Match>
                  <Match when={i.state === "error" && i}>
                    {(i) => (
                      <li class={pictureBox}>
                        Failed: {i().file.name}
                        <Button
                          onclick={() => {
                            setStore((f) => f.file === i().file, {
                              state: "pending",
                              file: i().file,
                            })
                          }}
                        >
                          Retry
                        </Button>
                      </li>
                    )}
                  </Match>
                </Switch>
              )}
            </For>
          </ul>
        </div>
      )}
    </div>
  )
}

const pictureBox = css({
  width: 180,
  aspectRatio: 1,
  bg: "white",
  borderRadius: "md",
  overflow: "hidden",
})
