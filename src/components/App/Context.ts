import { createContext, Dispatch, SetStateAction } from "react"

export type FileNames = "types" | "query" | "mutation"

export type Files = {
  [name: string]: {
    name: string
    value: string
  }
}

export interface SchemaInfo {
  types: Array<string>
  queries: Array<string>
  mutations: Array<string>
}

interface AppContext {
  files: Files
  setFiles: Dispatch<SetStateAction<Files>>
  connection: string
  code: string
  schema: SchemaInfo
  setSchema: Dispatch<SetStateAction<SchemaInfo>>
  setCode: Dispatch<SetStateAction<string>>
}

export const contextFiles: Files = {
  types: {
    name: "types.graphql",
    value: ""
  },
  query: {
    name: "query.graphql",
    value: ""
  },
  mutation: {
    name: "mutation.graphql",
    value: ""
  }
}

export const Context = createContext<AppContext>({
  files: contextFiles,
  setFiles: () => null,
  code: "",
  schema: { types: [], queries: [], mutations: [] },
  setSchema: () => null,
  setCode: () => null,
  connection: ""
})

export const { Provider } = Context
