import { gql } from 'apollo-server'

const typeDefs = gql`
  scalar Date

  type Listing {
    description: String!
    id: ID!
    title: String!
  }

  type User {
    email: String!
    id: ID!
  }

  type UserSession {
    createdAt: Date!
    expriesAt: Date!
    id: ID!
    user: User!
  }

  type Mutation {
    deleteUserSession(sessionId: ID!): Boolean!
    createUser(email: String!, password: String!): User!
    createListing(description: String!, title: String!): Listing!
    createUserSession(email: String!, password: String!): UserSession!
  }

  type Query {
    listings: [Listing!]!
    userSession(me: Boolean!): UserSession
  }
`

export default typeDefs;
