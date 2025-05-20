import "solid-devtools"
import { render } from "solid-js/web"
import { App } from "./App"
import "./index.css"

const elt = document.getElementById("root")
if (!elt) throw new Error("Cannot find element #root to render app")

render(() => <App />, elt)
