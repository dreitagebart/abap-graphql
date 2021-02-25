import {
  buildSchema,
  GraphQLObjectType,
  parse,
  buildASTSchema,
  validateSchema as validate,
  GraphQLSchema,
  GraphQLError
} from "graphql"
import { SchemaInfo } from "../components"

const directive = "directive @class(name: String) on FIELD_DEFINITION"

export const validateSchema = (
  types: string,
  query: string,
  mutation: string
): readonly GraphQLError[] => {
  let ast: GraphQLSchema

  try {
    const document = parse(`${directive} ${types} ${query} ${mutation}`)

    ast = buildASTSchema(document)

    return validate(ast)
  } catch (error) {
    return [error]
  }

  // const schema: GraphQLSchema = new GraphQLSchema({ types, query, mutation })
  // return []
}

export const getSchemaInfo = (
  typeDef: string,
  query: string,
  mutation: string
): SchemaInfo => {
  const types: Array<string> = []
  const queries: Array<string> = []
  const mutations: Array<string> = []

  if (typeDef) {
    // const schema: GraphQLSchema = new GraphQLSchema({types: [{}]})

    buildSchema(`${directive} ${typeDef} ${query} ${mutation}`, {})
      .toConfig()
      .types.map((type) => {
        if (type.astNode?.kind === "ObjectTypeDefinition") {
          if (type.name === "Query") {
            Object.keys((type as GraphQLObjectType).getFields()).map((key) =>
              queries.push(key)
            )

            return true
          }

          if (type.name === "Mutation") {
            Object.keys((type as GraphQLObjectType).getFields()).map((key) =>
              mutations.push(key)
            )
          }

          return types.push(type.name)
        }

        return false
      })
  }

  return { types, queries, mutations }
}
