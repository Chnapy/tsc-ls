import { gql } from 'graphql-tag';
import styles from './test.module.css';

export const toto: string = styles.root;

const documentNode = gql(`
    query UserSuccess($id: ID!) {
        user(id: $id) {
            id
            name
        }
        users {
            id
        }
    }
`);

type QueryReturn = ReturnType<NonNullable<typeof documentNode.__apiType>>;

export const user: QueryReturn['user'] = {
  id: '',
  name: 'foo',
};
