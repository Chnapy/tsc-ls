import { gql } from 'graphql-tag';
import styles from './test.module.css';

export const toto: string = styles.roo;

const documentNode = gql(`
    query UserSuccess($id: ID!) {
        user(id: $id) {
            id
            name
        }
        users {
            id
            thisOneDoesNotExist
        }
    }
`);
