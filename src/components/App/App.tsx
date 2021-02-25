import React, { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { api, getSchemaInfo } from "../../utils"

import { Content, Footer, Header } from "../Layout"
import { contextFiles, Provider, SchemaInfo, Files } from "./Context"
import { SApp } from "./Styled"

interface Props {}

export const App: React.FC<Props> = () => {
  const [files, setFiles] = useState<Files>(contextFiles)
  const [code, setCode] = useState("")
  const [schema, setSchema] = useState<SchemaInfo>({
    types: [],
    mutations: [],
    queries: []
  })

  useEffect(() => {
    api.post.loadSchema().then((response) => {
      if (response.data) {
        const { types, query, mutation } = response.data

        // setSchema(getSchemaInfo(types, query, mutation))
        setFiles((f) => ({
          ...f,
          types: { ...f.types, value: response.data.types },
          query: { ...f.query, value: response.data.query },
          mutation: { ...f.mutation, value: response.data.mutation }
        }))
      }

      setCode(response.data.data)
    })
  }, [])

  return (
    <Provider
      value={{
        files,
        setFiles,
        code,
        setCode,
        schema,
        setSchema,
        connection: process.env.REACT_APP_SAP_CONNECTION!
      }}
    >
      <BrowserRouter>
        <SApp></SApp>
        <Header></Header>
        <Content></Content>
        <Footer></Footer>
      </BrowserRouter>
    </Provider>
  )
}

export default App
