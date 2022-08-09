import { gql } from 'graphql-tag';

export const documentNode = gql(`
    query UserError($id: ID!) {
        user(id: $id) {
            id
            thisOneDoesNotExist
        }
    }
`);
