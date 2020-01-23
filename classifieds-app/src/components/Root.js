import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: 1rem;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0 auto;
  width: 80rem;
`;

const Content = styled.div`
  background-color: red;
  flex: 1;
  margin-right: 1rem;
`;

const Sidebar = styled.div`
  background-color: blue;
  flex: 0 auto;
  width: 10rem;
`;

const Root = () => {
  return (
    <Wrapper>
      <Container>
        <Content>Content</Content>
        <Sidebar>Sidebar</Sidebar>
      </Container>
    </Wrapper>
  );
};

export default Root;
