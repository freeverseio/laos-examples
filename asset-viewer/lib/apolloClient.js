import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.laosnetwork.io/graphql',
  cache: new InMemoryCache(),
});

export default client;
