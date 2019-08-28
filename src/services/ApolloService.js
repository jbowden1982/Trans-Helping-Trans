import { ApolloLink } from 'apollo-link';
import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from "subscriptions-transport-ws";
import { HttpLink } from 'apollo-link-http';

// const URI = '34.73.117.139';
const URI = '192.168.1.73';

const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription',
  )

let link = ApolloLink.split(hasSubscriptionOperation,
  new WebSocketLink({
    uri: 'ws://' + URI + ':4000',
    options: {reconnect: true}
  }),
  new HttpLink({
    uri: 'http://' + URI + ':4000'
  }));

export let client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new WebSocketLink({
    uri: 'ws://' + URI + ':4000',
    options: {reconnect: true}
  }),
  headers: {
    authorization: ``
  }
});

function setAuthorization(token) {
  return new Promise(async (resolve, reject) => {

    try {
      link = ApolloLink.split(hasSubscriptionOperation,
        new WebSocketLink({
          uri: 'ws://' + URI + ':4000',
          options: {
            reconnect: true,
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        }),
        new HttpLink({
          uri: 'http://' + URI + ':4000',
          headers: {
            authorization: `Bearer ${token}`
          }
        }));

      client = await new ApolloClient({
        cache: new InMemoryCache(),
        link
      })

      resolve(client);
    } catch (err) {
      reject(err);
    }
  })
}
export { gql, setAuthorization }
