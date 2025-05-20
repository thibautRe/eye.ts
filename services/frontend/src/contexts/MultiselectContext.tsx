import type { PictureId } from "core"
import {
  createContext,
  createEffect,
  onCleanup,
  useContext,
  type ParentComponent,
} from "solid-js"
import { createStore } from "solid-js/store"

export type MultiselectStore = {
  enabled: boolean
  selectedIds: ReadonlySet<PictureId>
  lastTouchedIndex: number
}
type MultiselectStoreUpdater = {
  onToggleSelection: (id: PictureId) => void
  onChangeEnabled: (enabled: boolean) => void
}

const MultiselectContext =
  createContext<[MultiselectStore, MultiselectStoreUpdater]>()

export const MultiselectContextProvider: ParentComponent<{
  pictures: readonly { id: PictureId }[]
}> = (p) => {
  const [store, setStore] = createStore<MultiselectStore>({
    enabled: false,
    selectedIds: new Set(),
    lastTouchedIndex: -1,
  })

  let shiftEnabled = false
  createEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Shift") shiftEnabled = true
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Shift") shiftEnabled = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    })
  })

  const updater: MultiselectStoreUpdater = {
    onToggleSelection(id) {
      setStore((s) => {
        const newS = new Set(s.selectedIds)
        const lastTouchedIndex = p.pictures.findIndex((p) => p.id === id)
        const touchedPics =
          lastTouchedIndex < s.lastTouchedIndex
            ? p.pictures.slice(lastTouchedIndex, s.lastTouchedIndex + 1)
            : p.pictures.slice(s.lastTouchedIndex, lastTouchedIndex)
        if (newS.has(id)) {
          newS.delete(id)
          if (shiftEnabled && s.lastTouchedIndex !== -1) {
            for (const touched of touchedPics) newS.delete(touched.id)
          }
        } else {
          newS.add(id)
          if (shiftEnabled && s.lastTouchedIndex !== -1) {
            for (const touched of touchedPics) newS.add(touched.id)
          }
        }
        if (lastTouchedIndex === -1) {
          return { ...s, selectedIds: newS }
        }

        return { ...s, lastTouchedIndex, selectedIds: newS }
      })
    },
    onChangeEnabled(enabled) {
      setStore("enabled", enabled)
    },
  }

  return (
    <MultiselectContext.Provider value={[store, updater]}>
      {p.children}
    </MultiselectContext.Provider>
  )
}

export const useMultiselectContext = () => {
  const context = useContext(MultiselectContext)
  if (!context) throw new Error("Expected MultiselectContext to be defined")
  return context
}
