type D1Statement = {
  bind: (...values: unknown[]) => D1Statement
  all: <T>() => Promise<{ results: T[] }>
  first: <T>() => Promise<T | null>
  run: () => Promise<unknown>
}

export type Env = {
  DB: {
    prepare: (query: string) => D1Statement
  }
}

export type FunctionContext = {
  env: Env
  params: Record<string, string | undefined>
  request: Request
}
