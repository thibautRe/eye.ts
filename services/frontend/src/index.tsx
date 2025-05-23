import "solid-devtools"
import { render } from "solid-js/web"
import { App } from "./App"
import "./index.css"
import { initIdentity } from "./utils/identity"

initIdentity()

const elt = document.getElementById("root")
if (!elt) throw new Error("Cannot find element #root to render app")

render(() => <App />, elt)
