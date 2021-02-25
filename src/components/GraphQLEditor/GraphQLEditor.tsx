import React, {
  Fragment,
  useCallback,
  useContext,
  useRef,
  useState,
  MouseEvent
} from "react"
import {
  ActionBar,
  Button,
  TabGroup,
  Tab,
  MessageStrip
} from "fundamental-react"
import CodeEditor, { Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"

import { Context, FileNames } from "../App"
import { api, getSchemaInfo, validateSchema } from "../../utils"
import { GraphQLError } from "graphql"
import { SMessage } from "./Styled"

interface Props {
  type: FileNames
  name: string
}

export const GraphQLEditor: React.FC<Props> = ({ type = "types", name }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [errors, setErrors] = useState<readonly GraphQLError[]>([])
  const [fileName, setFileName] = useState<FileNames>(type)
  const { setSchema, files, setFiles } = useContext(Context)

  const handleValidation = useCallback((markers: Array<editor.IMarker>) => {
    markers.forEach((marker) => console.log("onValidate:", marker.message))
  }, [])

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const errors = validateSchema(
      files.types.value,
      files.query.value,
      files.mutation.value
    )

    setErrors(errors)

    if (errors.length > 0) {
      return
    }

    setSchema(
      getSchemaInfo(files.types.value, files.query.value, files.mutation.value)
    )

    api.post.saveSchema({
      types: files.types.value,
      query: files.query.value,
      mutation: files.mutation.value
    })
  }

  const handleCheck = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const errors = validateSchema(
      files.types.value,
      files.query.value,
      files.mutation.value
    )

    setErrors(errors)

    if (errors.length > 0) {
      return
    }
  }

  const handleCodeChange = useCallback(
    (value, event: editor.IModelContentChangedEvent) => {
      if (value) {
        setFiles((f) => {
          return { ...f, [fileName]: { ...f[fileName], value } }
        })
      }
    },
    [setFiles, fileName]
  )

  const handleEditorMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    monacoRef.current = monaco
    editorRef.current = editor
  }

  // useEffect(() => {
  //   setFileName(type)
  // }, [type])

  // useEffect(() => {
  //   if (monaco && type && name) {
  //     let search = ""

  //     switch (type) {
  //       case "object": {
  //         search = `type ${name}`
  //         break
  //       }
  //       case "query": {
  //         search = `${name}`
  //         break
  //       }
  //       case "mutation": {
  //         search = `${name}`
  //         break
  //       }
  //       default: {
  //         break
  //       }
  //     }

  //     monaco.editor.getModels().map((model) => {
  //       const matches = model.findMatches(
  //         search,
  //         true,
  //         false,
  //         true,
  //         null,
  //         true,
  //         1
  //       )

  //       if (matches.length === 1) {
  //         const range = matches[0].range

  //         editorRef.current?.revealRangeAtTop(range, 0)
  //       }

  //       return false
  //     })
  //   }
  // }, [monaco, type, name, editorRef])

  return (
    <Fragment>
      <ActionBar
        actions={
          <Fragment>
            <Button onClick={handleCheck} glyph="checklist">
              Check
            </Button>
            <Button option="emphasized" onClick={handleSave} glyph="save">
              Save
            </Button>
          </Fragment>
        }
        description={"Action Bar Description"}
        title="GraphQL Editor"
      />

      {errors.map((error, index) => {
        return (
          <SMessage key={index}>
            <MessageStrip type="error">{error.message}</MessageStrip>
          </SMessage>
        )
      })}

      <TabGroup
        onTabClick={(event, index) => {
          Object.keys(files).map((key, i) => {
            if (index === i) {
              console.log("setFileName:", key)
              setFileName(key as FileNames)
            }
            return false
          })
        }}
      >
        <Tab title="Types" id="types">
          <CodeEditor
            height="90vh"
            width="100%"
            theme="vs-dark"
            language="graphql"
            path={files.types.name}
            value={files.types.value}
            onMount={handleEditorMount}
            onChange={handleCodeChange}
            onValidate={handleValidation}
          ></CodeEditor>
        </Tab>
        <Tab title="Query" id="query">
          <CodeEditor
            height="90vh"
            width="100%"
            theme="vs-dark"
            language="graphql"
            path={files.query.name}
            value={files.query.value}
            onMount={handleEditorMount}
            onChange={handleCodeChange}
            onValidate={handleValidation}
          ></CodeEditor>
        </Tab>
        <Tab title="Mutation" id="mutation">
          <CodeEditor
            height="90vh"
            width="100%"
            theme="vs-dark"
            language="graphql"
            path={files.mutation.name}
            value={files.mutation.value}
            onMount={handleEditorMount}
            onChange={handleCodeChange}
            onValidate={handleValidation}
          ></CodeEditor>
        </Tab>
      </TabGroup>
    </Fragment>
  )
}
