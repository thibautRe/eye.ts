import { Show, type ParentComponent } from "solid-js"
import { identity } from "../utils/identity"

export const AdminFence: ParentComponent = (p) => {
  return <Show when={identity()?.role === "admin"}>{p.children}</Show>
}
