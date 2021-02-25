import React, { useEffect } from "react"
import { gql } from "@apollo/client"
import { RouteComponentProps } from "react-router-dom"

import { client } from "../utils"

interface Props extends RouteComponentProps {}

export const Apollo: React.FC<Props> = () => {
  useEffect(() => {
    client
      .mutate({
        mutation: gql`
          mutation UpdateMaterial(
            $material: String!
            $materialType: String
            $authorizationGroup: String
          ) {
            updateMaterial(
              material: $material
              materialType: $materialType
              authorizationGroup: $authorizationGroup
            ) {
              material
            }
          }
        `,
        variables: { material: "123", materialType: "ZMAT" }
      })
      .then((data) => {
        debugger
      })
      .catch((error) => {
        debugger
      })

    client
      .query({
        query: gql`
          query GetMaterial($material: String!) {
            getMaterial(material: $material) {
              material
              materialType
              authorizationGroup
            }
          }
        `,
        variables: { material: "123" }
      })
      .then((result) => {
        debugger
        console.log(result)
      })
      .catch((error) => {
        console.error(error)
      })

    client
      .query({
        query: gql`
          query GetMaterials($material: String!) {
            getMaterials {
              material
              materialType
              authorizationGroup
            }
          }
        `,
        variables: { material: "123" }
      })
      .then((result) => {
        debugger
        console.log(result)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  return (
    <div>
      <h1>Apollo Test</h1>
    </div>
  )
}
