import { Title } from "@solidjs/meta"
import { uploadFiles } from "~/api"
import Counter from "~/components/Counter"

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <input
        type="file"
        multiple
        accept="*.jpg, *.jpeg"
        onchange={async (e) => {
          if (e.target.files) await uploadFiles(e.target.files)
        }}
      />
      <Counter />
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  )
}
