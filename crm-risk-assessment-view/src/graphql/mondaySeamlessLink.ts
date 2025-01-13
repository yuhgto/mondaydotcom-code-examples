import { Observable, ApolloLink } from '@apollo/client';
import { SeamlessApiClient, SeamlessApiClientError } from '@mondaydotcomorg/api';
import { print } from 'graphql/language/printer';

const mondayApiClient = new SeamlessApiClient();

export const mondaySeamlessLink:ApolloLink = new ApolloLink((operation) => {
    return new Observable((observer) => {
      const queryString = print(operation.query);
      mondayApiClient.request(
        queryString,
        operation.variables
      )
        .then((response:any) => {
          console.log({response})
          observer.next(response.data)
          observer.complete();
        })
        .catch((err:SeamlessApiClientError) => {
          observer.error({
            errors: err.response.errors as SeamlessApiClientError
          })
        })
    })
  });