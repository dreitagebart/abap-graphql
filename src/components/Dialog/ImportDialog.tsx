import React, { useCallback, useContext, useRef, useState } from "react"
import debounce from "lodash.debounce"
import {
  Button,
  Dialog,
  SearchInput,
  Select,
  Tab,
  TabGroup
} from "fundamental-react"
import CodeEditor, { Monaco } from "@monaco-editor/react"

import { api } from "../../utils"
import { SImportHeader } from "./Styled"
import { Context, FileNames, Files } from "../App"
import { editor } from "monaco-editor"
import { useHistory } from "react-router-dom"

interface Props {
  show: boolean
  onClose: () => void
}

interface FormState {
  selected: string
  object: string
  options: Array<{ key: string; text: string }>
}

const initialForm: FormState = {
  selected: "class",
  object: "",
  options: [
    { key: "class", text: "Class" },
    { key: "function", text: "Function module" }
  ]
}

const importFiles: Files = {
  types: {
    name: "typesImport.graphql",
    value: ""
  },
  query: {
    name: "queryImport.graphql",
    value: ""
  },
  mutation: {
    name: "mutationImport.graphql",
    value: ""
  }
}

export const ImportDialog: React.FC<Props> = ({ show, onClose }) => {
  const history = useHistory()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const { setFiles: setGlobalFiles } = useContext(Context)
  const [result, setResult] = useState<Array<{ text: string }>>([])
  const [files, setFiles] = useState<Files>(importFiles)
  const [form, setForm] = useState<FormState>(initialForm)
  const [fileName, setFileName] = useState<FileNames>("types")

  const handleImport = useCallback(() => {
    setGlobalFiles((globalFile) => {
      return {
        ...globalFile,
        types: {
          ...globalFile.types,
          value: `${files.types.value}${files.types.value ? "\n\n" : ""}${
            globalFile.types.value
          }`
        },
        query: {
          ...globalFile.query,
          value: `${files.query.value}${files.query.value ? "\n\n" : ""}${
            globalFile.query.value
          }`
        },
        mutation: {
          ...globalFile.mutation,
          value: `${files.mutation.value}${files.mutation.value ? "\n\n" : ""}${
            globalFile.mutation.value
          }`
        }
      }
    })
    setForm(initialForm)
    onClose()
    history.push("/editor")
  }, [onClose, files, setGlobalFiles, history])

  const handleSelect = useCallback((event: React.SyntheticEvent, data: any) => {
    setForm((f) => ({ ...f, object: data.text }))
  }, [])

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, object: event.target.value }))
      switch (form.selected) {
        case "class": {
          return api.post
            .searchClass({ search: event.target.value })
            .then((response) => {
              setResult(
                response.data.objects.map(({ key, text }: any) => ({
                  text: `${key}`,
                  callback: () => {}
                }))
              )
            })
        }
        case "function": {
          return api.post
            .searchFunction({ search: event.target.value })
            .then((response) => {
              setResult(
                response.data.objects.map(({ key, text }: any) => ({
                  text: `${key}`,
                  callback: () => {}
                }))
              )
            })
        }
      }
    },
    500
  )

  const handleGenerate = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      debugger
      event.preventDefault()

      switch (form.selected) {
        case "class": {
          return api.post
            .importClass({ object: form.object })
            .then(({ data: { types, query, mutation } }) => {
              setFiles((f) => ({
                ...f,
                types: { ...f.types, value: types },
                query: { ...f.query, value: query },
                mutation: { ...f.mutation, value: mutation }
              }))
            })
            .catch((error) => {
              debugger
            })
        }
        case "function": {
          return api.post
            .importFunction({ object: form.object })
            .then((response) => {
              debugger
            })
            .catch((error) => {
              debugger
            })
        }
      }
    },
    [form]
  )

  const handleValidation = useCallback((markers: Array<editor.IMarker>) => {
    markers.forEach((marker) => console.log("onValidate:", marker.message))
  }, [])

  const handleCodeChange = useCallback(
    (value) => {
      if (value) {
        setFiles((f) => ({ ...f, [fileName]: { ...f[fileName], value } }))
      }
    },
    [fileName]
  )

  const handleEditorMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    monacoRef.current = monaco
    editorRef.current = editor
  }

  return (
    <Dialog
      size="xl"
      show={show}
      onClose={onClose}
      title="Import ABAP Object"
      actions={[
        <Button onClick={() => handleImport()} option="emphasized">
          Import
        </Button>,
        <Button
          onClick={() => {
            onClose()
          }}
        >
          Cancel
        </Button>
      ]}
    >
      <form onSubmit={handleGenerate}>
        <SImportHeader>
          <div style={{ marginRight: 8 }}>
            <Select
              selectedKey={form.selected}
              options={form.options}
              onSelect={(event, selected) => {
                setForm((f) => ({ ...f, selected: selected.key }))
              }}
            ></Select>
          </div>
          <div style={{ marginRight: 8 }}>
            <SearchInput
              placeholder="Development object"
              searchList={result}
              onChange={handleSearch}
              onSelect={handleSelect}
            ></SearchInput>
          </div>
          <Button typeAttr="submit" type="attention" option="emphasized">
            Generate SDL
          </Button>
        </SImportHeader>
      </form>
      <TabGroup
        selectedIndex={Object.keys(files).indexOf(fileName)}
        onTabClick={(event, index) => {
          Object.keys(files).map((key, i) => {
            if (index === i) {
              setFileName(key as FileNames)
            }
            return false
          })
        }}
      >
        <Tab title="Types" id="types"></Tab>
        <Tab title="Query" id="query"></Tab>
        <Tab title="Mutation" id="mutation"></Tab>
      </TabGroup>
      <CodeEditor
        height="90vh"
        width="80vw"
        theme="vs-dark"
        language="graphql"
        path={files[fileName].name}
        value={files[fileName].value}
        onMount={handleEditorMount}
        onChange={handleCodeChange}
        onValidate={handleValidation}
      ></CodeEditor>
    </Dialog>
  )
}
