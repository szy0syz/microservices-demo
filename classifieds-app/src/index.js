import React from 'react';
import { render } from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import Root from './components/Root';

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
  <>
    <GlobalStyle />
    <Root />
  </>,
  document.getElementById('app')
);
