import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

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
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Root />
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('app')
);
