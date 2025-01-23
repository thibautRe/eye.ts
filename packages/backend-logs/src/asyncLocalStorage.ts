import { AsyncLocalStorage } from "node:async_hooks"
import { randomInt } from "node:crypto"
import type { ID } from "core"

type RequestId = ID<"request">
interface Storage {
  requestId: RequestId
  dbQueries: number
}

export const asyncLocalStorage = new AsyncLocalStorage<Storage>()

export const makeStorage = (): Storage => ({
  requestId: `${randomInt(1e5)}`.padStart(5, "0") as RequestId,
  dbQueries: 0,
})
