import React from 'react';
import { render } from 'react-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import Root from '~/components/Root';

import * as theme from './theme';

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
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Root />
  </ThemeProvider>,
  document.getElementById('app')
);
