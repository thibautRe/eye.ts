export type PreMiddleware<TContext> = (args: {
  request: Request
  context: TContext
}) => void | TContext | Promise<TContext>
export type PostMiddleware<TContext> = (args: {
  request: Request
  response: Response
  context: TContext
}) => void | Promise<Response> | Response
export type RouterRun<TContext> = (args: {
  context: TContext
  request: Request
}) => Promise<Response> | Response

class Router<TContext> {
  private _premiddlewares: PreMiddleware<TContext>[] = []
  private _postmiddlewares: PostMiddleware<TContext>[] = []

  constructor() {}

  withPreMiddleware(preMiddleware: PreMiddleware<TContext>) {
    this._premiddlewares.push(preMiddleware)
    return this
  }
  withPostMiddleware(postMiddleware: PostMiddleware<TContext>) {
    this._postmiddlewares.push(postMiddleware)
    return this
  }
  run(run: RouterRun<TContext>, initContext: TContext) {
    return async (request: Request): Promise<Response> => {
      let context = initContext
      for (const preMid of this._premiddlewares) {
        const ret = await Promise.resolve(preMid({ request, context }))
        if (ret) context = ret
      }
      let response = await run({ context, request })
      for (const postMid of this._postmiddlewares) {
        const ret = await Promise.resolve(
          postMid({ request, response, context }),
        )
        if (ret) response = ret
      }
      return response
    }
  }
}

export const createRouter = <TContext>() => new Router<TContext>()
