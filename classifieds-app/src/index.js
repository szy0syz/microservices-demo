import '@babel/polyfill';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import store from './store';
import * as theme from './theme';
import Root from '~/components/Root';
import client from '~/api/graphqlClient';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

  html, body, #app {
    height:100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  body {
    font-family: Roboto, sans-serif;
  }
`;

render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Root />
      </ThemeProvider>
    </ApolloProvider>
  </Provider>,
  document.getElementById('app')
);
